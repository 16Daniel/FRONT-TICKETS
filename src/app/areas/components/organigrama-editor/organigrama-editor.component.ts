import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { Subscription } from 'rxjs';
import { AvatarModule } from 'ngx-avatars';
import { AreaOrganigrama } from '../../interfaces/area-organigrama.model';
import { OrganigramaLegacyNode } from '../../interfaces/organigrama-legacy-node.interface';
import { OrganigramaNodo } from '../../interfaces/organigrama-nodo.interface';
import { AreaOrganigramaService } from '../../services/area-organigrama.service';
import { Responsable } from '../../../usuarios/interfaces/responsable.interface';
import { ResponsablesService } from '../../../usuarios/services/responsables.service';

@Component({
  selector: 'app-organigrama-editor',
  standalone: true,
  imports: [CommonModule, OrganizationChartModule, AvatarModule],
  templateUrl: './organigrama-editor.component.html',
  styleUrl: './organigrama-editor.component.scss',
})
export class OrganigramaEditorComponent implements OnChanges, OnDestroy {
  @Input() areaId = '';
  @Input() legacyOrganigrama: OrganigramaLegacyNode[] = [];
  @Output() organigramaChange = new EventEmitter<AreaOrganigrama>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() readyChange = new EventEmitter<boolean>();

  readonly nombresNiveles = ['Dirección', 'Gerente de área', 'Coordinador', 'Responsable'];
  raiz = this.crearNodo(1);
  nodosOrganigrama: TreeNode[] = [];
  opcionesResponsables: { id: string; nombre: string; color: string }[] = [];
  cargando = false;
  errorCarga = '';
  selectorAbiertoKey: string | null = null;
  busquedaResponsable = '';

  private readonly subscriptions = new Subscription();

  constructor(
    private areaOrganigramaService: AreaOrganigramaService,
    private responsablesService: ResponsablesService
  ) {
    this.subscriptions.add(
      this.responsablesService.responsables$.subscribe((responsables: Responsable[]) => {
        this.opcionesResponsables = responsables
          .filter(responsable => Boolean(responsable.id))
          .map(responsable => ({
            id: String(responsable.id),
            nombre: responsable.nombre,
            color: responsable.color || '#64748b',
          }));
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['areaId'] && this.areaId) {
      void this.cargarOrganigrama();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async cargarOrganigrama(): Promise<void> {
    this.cargando = true;
    this.errorCarga = '';
    this.readyChange.emit(false);

    try {
      const guardado = await this.areaOrganigramaService.obtenerPorArea(this.areaId);
      this.raiz = guardado
        ? this.normalizarOrganigrama(guardado)
        : this.convertirOrganigramaAnterior(this.legacyOrganigrama);
      this.notificarCambios();
    } catch (error) {
      console.error('Error al cargar el organigrama del área:', error);
      this.errorCarga = 'No fue posible cargar el organigrama. Intenta nuevamente.';
      this.validityChange.emit(false);
    } finally {
      this.cargando = false;
      this.readyChange.emit(!this.errorCarga);
    }
  }

  get gerente(): OrganigramaNodo {
    return this.raiz.children[0];
  }

  get esOrganigramaValido(): boolean {
    return this.esValido();
  }

  obtenerIconoNivel(id: number): string {
    switch (id) {
      case 1:
        return 'bx bx-buildings';
      case 2:
        return 'bx bx-briefcase-alt-2';
      case 3:
        return 'bx bx-user-voice';
      default:
        return 'bx bx-user-check';
    }
  }

  cerrarSelector(): void {
    if (this.selectorAbiertoKey !== null) {
      this.selectorAbiertoKey = null;
      this.busquedaResponsable = '';
    }
  }

  agregarCoordinador(): void {
    this.gerente.children = [...this.gerente.children, this.crearNodo(3)];
    this.notificarCambios();
  }

  agregarResponsable(coordinador: OrganigramaNodo): void {
    coordinador.children = [...coordinador.children, this.crearNodo(4)];
    this.notificarCambios();
  }

  agregarResponsablePorClave(coordinadorId: string): void {
    const coordinador = this.obtenerNodo(coordinadorId);
    if (coordinador?.id === 3) {
      this.agregarResponsable(coordinador);
    }
  }

  eliminarCoordinador(coordinadorId: string): void {
    if (this.gerente.children.length <= 1) {
      return;
    }

    this.gerente.children = this.gerente.children
      .filter(coordinador => coordinador.key !== coordinadorId);
    this.notificarCambios();
  }

  eliminarResponsable(coordinador: OrganigramaNodo, responsableId: string): void {
    if (coordinador.children.length <= 1) {
      return;
    }

    coordinador.children = coordinador.children
      .filter(responsable => responsable.key !== responsableId);
    this.notificarCambios();
  }

  puedeEliminarResponsable(parentKey: string | undefined): boolean {
    const coordinador = parentKey ? this.obtenerNodo(parentKey) : undefined;
    return Boolean(coordinador && coordinador.children.length > 1);
  }

  eliminarResponsablePorClave(parentKey: string | undefined, responsableId: string): void {
    const coordinador = parentKey ? this.obtenerNodo(parentKey) : undefined;
    if (coordinador) {
      this.eliminarResponsable(coordinador, responsableId);
    }
  }

  actualizarPersona(nodo: OrganigramaNodo, personaId: string | null): void {
    nodo.personaId = personaId ?? '';
    nodo.nombreResponsable = this.opcionesResponsables
      .find(opcion => opcion.id === nodo.personaId)?.nombre ?? '';
    this.actualizarPersonaVisual(this.nodosOrganigrama, nodo.key, nodo.personaId);
    this.emitirCambios();
  }

  actualizarPersonaPorClave(key: string, personaId: string | null): void {
    const nodo = this.obtenerNodo(key);
    if (nodo) {
      this.actualizarPersona(nodo, personaId);
      this.selectorAbiertoKey = null;
      this.busquedaResponsable = '';
    }
  }

  alternarSelector(key: string): void {
    this.selectorAbiertoKey = this.selectorAbiertoKey === key ? null : key;
    this.busquedaResponsable = '';
  }

  actualizarBusqueda(event: Event): void {
    this.busquedaResponsable = (event.target as HTMLInputElement).value;
  }

  obtenerOpcionesFiltradas(): { id: string; nombre: string; color: string }[] {
    const termino = this.busquedaResponsable.trim().toLocaleLowerCase();
    return this.opcionesResponsables.filter(opcion =>
      opcion.nombre.toLocaleLowerCase().includes(termino)
    );
  }

  crearNodoVisual(nodo: OrganigramaNodo, padreKey?: string): TreeNode {
    return {
      key: nodo.key,
      expanded: true,
      data: {
        key: nodo.key,
        id: nodo.id,
        nombre: nodo.nombre,
        personaId: nodo.personaId,
        padreKey,
      },
      children: nodo.children.map(hijo => this.crearNodoVisual(hijo, nodo.key)),
    };
  }

  obtenerNodo(key: string): OrganigramaNodo | undefined {
    const buscar = (actual: OrganigramaNodo): OrganigramaNodo | undefined => {
      if (actual.key === key) {
        return actual;
      }
      for (const hijo of actual.children) {
        const encontrado = buscar(hijo);
        if (encontrado) {
          return encontrado;
        }
      }
      return undefined;
    };

    return buscar(this.raiz);
  }

  obtenerResponsable(personaId: string): { id: string; nombre: string; color: string } | undefined {
    return this.opcionesResponsables.find(opcion => opcion.id === personaId);
  }

  obtenerIniciales(nombre: string): string {
    const palabras = nombre.trim().split(/\s+/).filter(Boolean);
    if (palabras.length > 1) {
      return palabras.slice(0, 2).map(palabra => palabra[0]).join('').toLocaleUpperCase();
    }

    return palabras[0]?.slice(0, 2).toLocaleUpperCase() ?? '';
  }

  private notificarCambios(): void {
    this.nodosOrganigrama = [this.crearNodoVisual(this.raiz)];
    this.emitirCambios();
  }

  private emitirCambios(): void {
    this.organigramaChange.emit({
      areaId: this.areaId,
      raiz: this.clonarNodo(this.raiz),
    });
    this.validityChange.emit(this.esValido());
  }

  private actualizarPersonaVisual(nodos: TreeNode[], key: string, personaId: string): void {
    for (const nodo of nodos) {
      if (nodo.key === key && nodo.data) {
        nodo.data['personaId'] = personaId;
        return;
      }
      this.actualizarPersonaVisual(nodo.children ?? [], key, personaId);
    }
  }

  private esValido(): boolean {
    return this.raiz.id === 1
      && Boolean(this.raiz.personaId)
      && this.gerente?.id === 2
      && Boolean(this.gerente.personaId)
      && this.gerente.children.length > 0
      && this.gerente.children.every(coordinador =>
        coordinador.id === 3
        && Boolean(coordinador.personaId)
        && coordinador.children.length > 0
        && coordinador.children.every(responsable =>
          responsable.id === 4 && Boolean(responsable.personaId)
        )
      );
  }

  private crearNodo(id: number): OrganigramaNodo {
    const nodo: OrganigramaNodo = {
      key: crypto.randomUUID(),
      id,
      nombre: this.nombresNiveles[id - 1],
      personaId: '',
      nombreResponsable: '',
      children: [],
    };

    if (id === 1) {
      nodo.children = [this.crearNodo(2)];
    } else if (id === 2) {
      nodo.children = [this.crearNodo(3)];
    } else if (id === 3) {
      nodo.children = [this.crearNodo(4)];
    }

    return nodo;
  }

  private crearNodoSinHijos(id: number): OrganigramaNodo {
    return {
      key: crypto.randomUUID(),
      id,
      nombre: this.nombresNiveles[id - 1],
      personaId: '',
      nombreResponsable: '',
      children: [],
    };
  }

  private clonarNodo(nodo: OrganigramaNodo): OrganigramaNodo {
    return {
      ...nodo,
      children: nodo.children.map(hijo => this.clonarNodo(hijo)),
    };
  }

  private normalizarOrganigrama(guardado: Partial<AreaOrganigrama>): OrganigramaNodo {
    if (guardado.raiz) {
      const raiz = this.normalizarNodo(guardado.raiz, 1);
      if (!raiz.children.length) {
        raiz.children = [this.crearNodo(2)];
      }

      const gerente = raiz.children[0];
      if (!gerente.children.length) {
        gerente.children = [this.crearNodo(3)];
      }
      gerente.children.forEach(coordinador => {
        if (!coordinador.children.length) {
          coordinador.children = [this.crearNodo(4)];
        }
      });
      return raiz;
    }

    const guardadoAnterior = guardado as Partial<AreaOrganigrama> & {
      niveles?: Array<{
        id: number;
        responsables?: Array<{ personaId?: string; nombre?: string }>;
      }>;
    };
    return this.convertirNivelesAnteriores(guardadoAnterior.niveles ?? []);
  }

  private normalizarNodo(nodo: OrganigramaNodo, id: number): OrganigramaNodo {
    const normalizado = this.crearNodoSinHijos(id);
    normalizado.key = nodo.key || normalizado.key;
    normalizado.personaId = nodo.personaId || '';
    normalizado.nombreResponsable = nodo.nombreResponsable || '';

    if (id === 1 && nodo.children?.[0]) {
      normalizado.children = [this.normalizarNodo(nodo.children[0], 2)];
    } else if (id === 2) {
      normalizado.children = (nodo.children ?? [])
        .filter(hijo => hijo.id === 3)
        .map(hijo => this.normalizarNodo(hijo, 3));
    } else if (id === 3) {
      normalizado.children = (nodo.children ?? [])
        .filter(hijo => hijo.id === 4)
        .map(hijo => this.normalizarNodo(hijo, 4));
    }

    return normalizado;
  }

  private convertirOrganigramaAnterior(nodos: OrganigramaLegacyNode[]): OrganigramaNodo {
    const ruta: OrganigramaLegacyNode[] = [];
    let actuales = nodos ?? [];
    for (let nivel = 0; nivel < this.nombresNiveles.length && actuales.length; nivel++) {
      ruta.push(actuales[0]);
      actuales = actuales[0].children ?? [];
    }

    const nodosNuevos = this.nombresNiveles.map((_, indice) =>
      this.crearDesdeAnterior(indice + 1, ruta[indice])
    );
    nodosNuevos[0].children = [nodosNuevos[1]];
    nodosNuevos[1].children = [nodosNuevos[2]];
    nodosNuevos[2].children = [nodosNuevos[3]];
    return nodosNuevos[0];
  }

  private crearDesdeAnterior(id: number, anterior?: OrganigramaLegacyNode): OrganigramaNodo {
    const asignacion = anterior?.data.asignados?.find(item =>
      !item.tipoPersona || item.tipoPersona === 'responsable'
    );
    const personaId = asignacion?.personaId
      ?? (anterior?.data.tipoPersona === 'responsable' ? anterior.data.personaId : '')
      ?? '';
    return {
      ...this.crearNodoSinHijos(id),
      personaId,
      nombreResponsable: asignacion?.nombre ?? anterior?.data.nombre ?? '',
    };
  }

  private convertirNivelesAnteriores(
    niveles: Array<{
      id: number;
      responsables?: Array<{ personaId?: string; nombre?: string }>;
    }>
  ): OrganigramaNodo {
    const nodos = this.nombresNiveles.map((_, indice) => {
      const responsable = niveles.find(nivel => Number(nivel.id) === indice + 1)?.responsables?.[0];
      return {
        ...this.crearNodoSinHijos(indice + 1),
        personaId: responsable?.personaId ?? '',
        nombreResponsable: responsable?.nombre ?? '',
      };
    });
    nodos[0].children = [nodos[1]];
    nodos[1].children = [nodos[2]];
    nodos[2].children = [nodos[3]];
    return nodos[0];
  }
}
