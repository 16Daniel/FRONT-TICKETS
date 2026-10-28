import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TabViewModule } from 'primeng/tabview';
import { Subscription } from 'rxjs';
import { Area, EscalationLevel, OrganigramaAsignacion, OrganigramaNode } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { EscalationManagerComponent } from '../../components/escalation-manager.component/escalation-manager.component';
import { Responsable } from '../../../usuarios/interfaces/responsable.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { ResponsablesService } from '../../../usuarios/services/responsables.service';
import { UsersService } from '../../../usuarios/services/users.service';

@Component({
  selector: 'app-modal-area-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, DropdownModule, TabViewModule, OrganizationChartModule, EscalationManagerComponent],
  templateUrl: './modal-area-create.component.html',
  styleUrl: './modal-area-create.component.scss'
})

export class ModalAreaCreateComponent implements OnDestroy {

  @Input() mostrarModalCrearArea: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() area: Area | any;
  @Input() esNuevaArea: boolean = true;
  idAreaEditar: string = '';
  parentLevels = signal<EscalationLevel[]>([]);
  grupoNuevosTickets = signal<string>('');
  organigrama: OrganigramaNode[] = [];
  usuarios: Usuario[] = [];
  responsables: Responsable[] = [];
  opcionesUsuarios: { id: string; nombre: string }[] = [];
  opcionesResponsables: { id: string; nombre: string }[] = [];
  private subscriptions = new Subscription();

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private areasService: AreasService,
    private usersService: UsersService,
    private responsablesService: ResponsablesService
  ) { }

  async ngOnInit(): Promise<void> {
    this.subscriptions.add(
      this.usersService.usuarios$.subscribe(usuarios => {
        this.usuarios = usuarios;
        this.opcionesUsuarios = usuarios
          .filter(usuario => Boolean(usuario.id))
          .map(usuario => ({ id: String(usuario.id), nombre: this.nombreUsuario(usuario) }));
      })
    );
    this.subscriptions.add(
      this.responsablesService.responsables$.subscribe(responsables => {
        this.responsables = responsables;
        this.opcionesResponsables = responsables
          .filter(responsable => Boolean(responsable.id))
          .map(responsable => ({
            id: String(responsable.id),
            nombre: responsable.posicion
              ? `${responsable.nombre} - ${responsable.posicion}`
              : responsable.nombre
          }));
      })
    );

    if (!this.esNuevaArea) {
      this.idAreaEditar = this.area.id;
    }
    
    if (this.esNuevaArea) {
      this.area.id = await this.areasService.obtenerSecuencial();
      this.area = {
      ...this.area,
      horarioTrabajo: this.crearHorarioPorDia(),
      horarioGuardia: this.crearHorarioPorDia()
    };
      this.cdr.detectChanges();
    } 

    if(!this.area.horarioTrabajo) {
      this.area.horarioTrabajo = this.crearHorarioPorDia();
    }
    if(!this.area.horarioGuardia) {
      this.area.horarioGuardia = this.crearHorarioPorDia();
    }
    if(this.area.nivelesNotificacion){
      this.parentLevels.set(this.area.nivelesNotificacion);
    }

    if(this.area.gruponotificacion){
      this.grupoNuevosTickets.set(this.area.gruponotificacion);
    }

    this.organigrama = this.clonarOrganigrama(this.area.organigrama ?? []);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  diasSemana = [
    { key: 'lunes', label: 'LUNES' },
    { key: 'martes', label: 'MARTES' },
    { key: 'miercoles', label: 'MIÉRCOLES' },
    { key: 'jueves', label: 'JUEVES' },
    { key: 'viernes', label: 'VIERNES' },
    { key: 'sabado', label: 'SÁBADO' },
    { key: 'domingo', label: 'DOMINGO' }
  ];

  crearHorarioPorDia() {
    return {
      lunes: { inicio: '', fin: '' },
      martes: { inicio: '', fin: '' },
      miercoles: { inicio: '', fin: '' },
      jueves: { inicio: '', fin: '' },
      viernes: { inicio: '', fin: '' },
      sabado: { inicio: '', fin: '' },
      domingo: { inicio: '', fin: '' }
    };
  }

  agregarNivelRaiz(): void {
    if (this.organigrama.length > 0) return;
    this.organigrama = [this.crearNodoOrganigrama()];
  }

  agregarSubnivel(nodo: OrganigramaNode): void {
    this.organigrama = this.actualizarNodo(this.organigrama, nodo.key, actual => ({
      ...actual,
      expanded: true,
      children: [...actual.children, this.crearNodoOrganigrama(true)]
    }));
  }

  agregarAsignacion(nodo: OrganigramaNode): void {
    this.organigrama = this.actualizarNodo(this.organigrama, nodo.key, actual => ({
      ...actual,
      data: {
        ...actual.data,
        asignados: [...actual.data.asignados, this.crearAsignacion()]
      }
    }));
  }

  eliminarAsignacion(nodo: OrganigramaNode, asignacionId: string): void {
    this.organigrama = this.actualizarNodo(this.organigrama, nodo.key, actual => ({
      ...actual,
      data: {
        ...actual.data,
        asignados: actual.data.asignados.filter(asignacion => asignacion.id !== asignacionId)
      }
    }));
  }

  actualizarPuesto(nodo: OrganigramaNode, puesto: string): void {
    this.organigrama = this.actualizarNodo(this.organigrama, nodo.key, actual => ({
      ...actual,
      data: { ...actual.data, puesto }
    }));
  }

  eliminarNodo(nodo: OrganigramaNode): void {
    this.organigrama = this.eliminarNodoDeArbol(this.organigrama, nodo.key);
  }

  cambiarTipoPersona(nodo: OrganigramaNode, asignacionId: string, esResponsable: boolean): void {
    this.actualizarAsignacion(nodo, asignacionId, asignacion => ({
      ...asignacion,
      tipoPersona: esResponsable ? 'responsable' : 'usuario',
      personaId: '',
      nombre: ''
    }));
  }

  actualizarPersona(nodo: OrganigramaNode, asignacion: OrganigramaAsignacion, personaId: string | null): void {
    const idPersona = personaId ?? '';
    const opciones = asignacion.tipoPersona === 'responsable'
      ? this.opcionesResponsables
      : this.opcionesUsuarios;
    this.actualizarAsignacion(nodo, asignacion.id, actual => ({
      ...actual,
      personaId: idPersona,
      nombre: opciones.find(opcion => opcion.id === idPersona)?.nombre ?? ''
    }));
  }

  nombreUsuario(usuario?: Usuario): string {
    return usuario
      ? [usuario.nombre, usuario.apellidoP, usuario.apellidoM].filter(Boolean).join(' ')
      : '';
  }

  esNodoRaiz(nodo: OrganigramaNode): boolean {
    return this.organigrama.some(raiz => raiz.key === nodo.key);
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    this.esNuevaArea ? this.crear() : this.actualizar();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async crear() {
    this.area = { ...this.area, id: String(this.area.id) }
    this.area.nivelesNotificacion = this.parentLevels();
    this.area.gruponotificacion = this.grupoNuevosTickets();
    this.area.organigrama = this.clonarOrganigrama(this.organigrama);
    try {
      await this.areasService.create({ ...this.area });
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Guardado correctamente');

    } catch (error: any) {
      this.showMessage('error', 'Error', error.message);
    }
  }

  async actualizar() {
    this.area = { ...this.area, id: String(this.area.id) }
    this.area.nivelesNotificacion = this.parentLevels();
    this.area.gruponotificacion = this.grupoNuevosTickets();
    this.area.organigrama = this.clonarOrganigrama(this.organigrama);
    try {
      await this.areasService.update(this.area, this.idAreaEditar);
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Enviado correctamente');
    } catch (error) {
      this.showMessage(
        'error',
        'Error',
        error instanceof Error ? error.message : 'No se pudo actualizar el área.'
      );
    }
  }

  private crearNodoOrganigrama(conAsignacion: boolean = false): OrganigramaNode {
    return {
      key: crypto.randomUUID(),
      expanded: true,
      data: {
        puesto: '',
        asignados: conAsignacion ? [this.crearAsignacion()] : []
      },
      children: []
    };
  }

  private crearAsignacion(): OrganigramaAsignacion {
    return {
      id: crypto.randomUUID(),
      tipoPersona: 'usuario',
      personaId: '',
      nombre: ''
    };
  }

  private clonarOrganigrama(nodos: OrganigramaNode[]): OrganigramaNode[] {
    return nodos.map(nodo => {
      const datosAnteriores = nodo.data as OrganigramaNode['data'] & {
        asignados?: OrganigramaAsignacion[];
        personaId?: string;
        tipoPersona?: 'usuario' | 'responsable';
        nombre?: string;
      };
      const asignados = datosAnteriores.asignados?.length
        ? datosAnteriores.asignados.map(asignacion => ({ ...asignacion }))
        : datosAnteriores.personaId
          ? [{
            id: crypto.randomUUID(),
            tipoPersona: datosAnteriores.tipoPersona ?? 'usuario',
            personaId: datosAnteriores.personaId,
            nombre: datosAnteriores.nombre ?? ''
          }]
          : [];

      return {
        ...nodo,
        data: {
          puesto: datosAnteriores.puesto || datosAnteriores.nombre || '',
          asignados
        },
        children: this.clonarOrganigrama(nodo.children ?? [])
      };
    });
  }

  private actualizarNodo(
    nodos: OrganigramaNode[],
    key: string,
    actualizar: (nodo: OrganigramaNode) => OrganigramaNode
  ): OrganigramaNode[] {
    return nodos.map(nodo => nodo.key === key
      ? actualizar(nodo)
      : { ...nodo, children: this.actualizarNodo(nodo.children, key, actualizar) }
    );
  }

  private actualizarAsignacion(
    nodo: OrganigramaNode,
    asignacionId: string,
    actualizar: (asignacion: OrganigramaAsignacion) => OrganigramaAsignacion
  ): void {
    this.organigrama = this.actualizarNodo(this.organigrama, nodo.key, actual => ({
      ...actual,
      data: {
        ...actual.data,
        asignados: actual.data.asignados.map(asignacion =>
          asignacion.id === asignacionId ? actualizar(asignacion) : asignacion
        )
      }
    }));
  }

  private eliminarNodoDeArbol(nodos: OrganigramaNode[], key: string): OrganigramaNode[] {
    return nodos
      .filter(nodo => nodo.key !== key)
      .map(nodo => ({ ...nodo, children: this.eliminarNodoDeArbol(nodo.children, key) }));
  }
}
