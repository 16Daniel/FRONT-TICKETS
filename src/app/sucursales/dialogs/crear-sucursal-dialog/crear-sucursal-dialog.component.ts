import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { SucursalesService } from '../../../sucursales/services/sucursales.service';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';
import { Sucursal } from '../../models/sucursal.model';

interface BorradorSoporteArea {
  idsUsuarios: string[];
  idResponsable: string;
}

@Component({
  selector: 'app-crear-sucursal-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, MultiSelectModule, TooltipModule],
  templateUrl: './crear-sucursal-dialog.component.html',
  styleUrl: './crear-sucursal-dialog.component.scss'
})

export class CrearSucursalDialogComponent implements OnInit, OnDestroy {
  readonly String = String;
  @Input() mostrarModalCrearSucursal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() sucursal: Sucursal | any;
  @Input() esNuevaSucursal: boolean = true;
  @Input() areaInicialId: string = '';
  idSucursalEditar: string = '';
  usuario: Usuario;

  areas: Area[] = [];
  areaSoporteSeleccionadaId: string = '';
  analistasPorArea: Record<string, { id: string; nombreCompleto: string }[]> = {};
  analistasNombreMap: Record<string, string> = {};
  soporteBorradorPorArea: Record<string, BorradorSoporteArea> = {};
  private areasModificadas = new Set<string>();

  private areasSub?: Subscription;
  private usuariosSub?: Subscription;
  private soporteSub?: Subscription;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private branchesService: SucursalesService,
    private areasService: AreasService,
    private usuariosService: UsuariosService,
    private usuarioSucursalService: UsuarioSucursalService
  ) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  async ngOnInit() {
    if (!this.esNuevaSucursal) {
      this.idSucursalEditar = String(this.sucursal.id);
    }

    if (this.esNuevaSucursal) {
      this.sucursal.id = await this.branchesService.obtenerSecuencial();
      this.cdr.detectChanges();
    }

    this.cargarAreas();
    this.cargarUsuarios();
    this.cargarSoporteExistente();
  }

  ngOnDestroy(): void {
    this.areasSub?.unsubscribe();
    this.usuariosSub?.unsubscribe();
    this.soporteSub?.unsubscribe();
  }

  get esRolAdministradorGlobal(): boolean {
    return String(this.usuario?.idRol ?? '').trim() === '1';
  }

  get idAreaUsuarioSesion(): string {
    return String(this.usuario?.idArea ?? '').trim();
  }

  private cargarAreas(): void {
    this.areasService.initListener();
    this.areasSub = this.areasService.areas$.subscribe((areas: Area[]) => {
      let areasActivas = areas.filter((a: Area) => !a.eliminado);
      if (!this.esRolAdministradorGlobal) {
        areasActivas = areasActivas.filter(
          (a: Area) => String(a.id) === this.idAreaUsuarioSesion
        );
      }
      this.areas = areasActivas;

      if (this.areas.length > 0 && !this.areas.some((a) => String(a.id) === this.areaSoporteSeleccionadaId)) {
        const existeInicial = this.areaInicialId && this.areas.some((a) => String(a.id) === String(this.areaInicialId));
        this.areaSoporteSeleccionadaId = existeInicial
          ? String(this.areaInicialId)
          : String(this.areas[0].id);
      }

      this.reconstruirAnalistasPorArea();
      this.sincronizarBorradoresNoModificados();
      this.cdr.detectChanges();
    });
  }

  private cargarUsuarios(): void {
    this.usuariosSub = this.usuariosService.usuarios$.subscribe(() => {
      this.reconstruirAnalistasPorArea();
      this.sincronizarBorradoresNoModificados();
      this.cdr.detectChanges();
    });
  }

  private cargarSoporteExistente(): void {
    this.soporteSub = this.usuarioSucursalService.usuarioSucursal$.subscribe(() => {
      this.sincronizarBorradoresNoModificados();
      this.cdr.detectChanges();
    });
  }

  private reconstruirAnalistasPorArea(): void {
    const mapaPorArea: Record<string, { id: string; nombreCompleto: string }[]> = {};
    const nombres: Record<string, string> = {};

    for (const area of this.areas) {
      const areaId = String(area.id);
      const analistas = this.usuariosService.obtenerAnalistasPorArea(areaId);
      mapaPorArea[areaId] = analistas
        .map((u) => {
          const id = String(u.id);
          const nombreCompleto = `${u.nombre} ${u.apellidoP}`.trim();
          nombres[id] = nombreCompleto;
          return { id, nombreCompleto };
        })
        .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
    }

    this.analistasPorArea = mapaPorArea;
    this.analistasNombreMap = nombres;
  }

  private sincronizarBorradoresNoModificados(): void {
    for (const area of this.areas) {
      const areaId = String(area.id);
      if (this.areasModificadas.has(areaId)) continue;

      if (this.esNuevaSucursal || !this.idSucursalEditar) {
        if (!this.soporteBorradorPorArea[areaId]) {
          this.soporteBorradorPorArea[areaId] = { idsUsuarios: [], idResponsable: '' };
        }
        continue;
      }

      const idsValidos = new Set((this.analistasPorArea[areaId] || []).map((a) => a.id));
      const idsGuardados = this.usuarioSucursalService
        .obtenerIdsUsuarios('SOPORTE', this.idSucursalEditar, areaId)
        .filter((id) => idsValidos.has(id));
      const principalGuardado = this.usuarioSucursalService.obtenerIdResponsable(
        'SOPORTE',
        this.idSucursalEditar,
        areaId
      );

      this.soporteBorradorPorArea[areaId] = {
        idsUsuarios: idsGuardados,
        idResponsable:
          principalGuardado && idsGuardados.includes(principalGuardado)
            ? principalGuardado
            : idsGuardados[0] || '',
      };
    }
  }

  cambiarAreaSoporte(areaId: string | number): void {
    const areaDestino = String(areaId);
    if (!this.esRolAdministradorGlobal && areaDestino !== this.idAreaUsuarioSesion) {
      return;
    }
    this.areaSoporteSeleccionadaId = areaDestino;
    if (!this.soporteBorradorPorArea[this.areaSoporteSeleccionadaId]) {
      this.soporteBorradorPorArea[this.areaSoporteSeleccionadaId] = {
        idsUsuarios: [],
        idResponsable: '',
      };
    }
  }

  get analistasAreaActual(): { id: string; nombreCompleto: string }[] {
    return this.analistasPorArea[this.areaSoporteSeleccionadaId] || [];
  }

  get borradorAreaActual(): BorradorSoporteArea {
    return (
      this.soporteBorradorPorArea[this.areaSoporteSeleccionadaId] || {
        idsUsuarios: [],
        idResponsable: '',
      }
    );
  }

  obtenerCantidadSoporteArea(areaId: string | number): number {
    return this.soporteBorradorPorArea[String(areaId)]?.idsUsuarios.length || 0;
  }

  onChangeUsuariosSoporte(idsSeleccionados: string[] | null): void {
    if (!this.areaSoporteSeleccionadaId) return;

    const areaId = this.areaSoporteSeleccionadaId;
    const anterior = this.soporteBorradorPorArea[areaId] || { idsUsuarios: [], idResponsable: '' };
    const nuevosIds = Array.from(new Set((idsSeleccionados || []).map(String)));
    const nuevoPrincipal =
      nuevosIds.length === 0
        ? ''
        : anterior.idResponsable && nuevosIds.includes(anterior.idResponsable)
          ? anterior.idResponsable
          : nuevosIds[0];

    this.soporteBorradorPorArea[areaId] = {
      idsUsuarios: nuevosIds,
      idResponsable: nuevoPrincipal,
    };
    this.areasModificadas.add(areaId);
    this.cdr.detectChanges();
  }

  seleccionarResponsablePrincipal(idUsuario: string): void {
    if (!this.areaSoporteSeleccionadaId) return;

    const areaId = this.areaSoporteSeleccionadaId;
    const actual = this.soporteBorradorPorArea[areaId];
    if (!actual || !actual.idsUsuarios.includes(idUsuario)) return;

    this.soporteBorradorPorArea[areaId] = {
      ...actual,
      idResponsable: idUsuario,
    };
    this.areasModificadas.add(areaId);
    this.cdr.detectChanges();
  }

  private async guardarCambiosSoporte(idSucursal: string): Promise<void> {
    if (this.areasModificadas.size === 0) return;

    const tareas: Promise<void>[] = [];
    for (const areaId of this.areasModificadas) {
      if (!this.esRolAdministradorGlobal && areaId !== this.idAreaUsuarioSesion) {
        continue;
      }
      const borrador = this.soporteBorradorPorArea[areaId];
      if (!borrador) continue;
      tareas.push(
        this.usuarioSucursalService.guardarPorSucursal(
          'SOPORTE',
          areaId,
          idSucursal,
          borrador.idsUsuarios,
          borrador.idResponsable
        )
      );
    }
    await Promise.all(tareas);
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    // console.log(this.sucursal)
    this.esNuevaSucursal ? this.crear() : this.actualizar();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async crear() {
    this.sucursal = { ...this.sucursal, id: parseInt(this.sucursal.id) }
    try {
      await this.branchesService.create({ ...this.sucursal });
      await this.guardarCambiosSoporte(String(this.sucursal.id));
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Guardado correctamente');

    } catch (error: any) {
      this.showMessage('error', 'Error', error.message);
    }
  }

  async actualizar() {
    this.sucursal = { ...this.sucursal, id: parseInt(this.sucursal.id) }
    try {
      await this.branchesService.update(this.sucursal, this.idSucursalEditar);
      await this.guardarCambiosSoporte(String(this.idSucursalEditar));
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Enviado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar la sucursal:', error);
      this.showMessage('error', 'Error', 'No se pudo actualizar la sucursal');
    }
  }

  esMantenimientoActivo(sucursal: Sucursal): boolean {
    const activo = Array.isArray(sucursal.activoMantenimientos)
      ? sucursal.activoMantenimientos
      : [];

    return activo.includes(this.usuario.idArea);
  }

  toggleMantenimiento(sucursal: Sucursal): void {
    if (!Array.isArray(sucursal.activoMantenimientos)) {
      sucursal.activoMantenimientos = [];
    }

    const index = sucursal.activoMantenimientos.indexOf(this.usuario.idArea);

    if (index > -1) {
      sucursal.activoMantenimientos.splice(index, 1);
    } else {
      sucursal.activoMantenimientos.push(this.usuario.idArea);
    }
  }
}
