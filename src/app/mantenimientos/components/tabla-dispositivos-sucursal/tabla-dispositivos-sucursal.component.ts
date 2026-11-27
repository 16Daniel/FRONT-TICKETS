import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { Sucursal } from '../../../sucursales/models/sucursal.model';
import { DispositivosSucursal } from '../../models/dispositivos-sucursal.model';
import { DispositivosSucursalesService } from '../../services/dispositivos-sucursales.service';
import {
  CampoOpcionalDispositivo,
  TipoDispositivo,
} from '../../interfaces/tipo-dispositivo.interface';
import {
  obtenerTipoDispositivoPorId,
  obtenerTiposDispositivoPorArea,
} from '../../interfaces/tipos-dispositivo.constants';
import { Dispositivo } from '../../interfaces/dispositivo.model';
import { EstatusTPV } from '../../interfaces/estatus-tpv.interface';
import { StatusTpvsDevicesService } from '../../services/status-tpvs-devices.service';

@Component({
  selector: 'app-tabla-dispositivos-sucursal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, DropdownModule, TooltipModule],
  templateUrl: './tabla-dispositivos-sucursal.component.html',
  styleUrl: './tabla-dispositivos-sucursal.component.scss',
})
export class TablaDispositivosSucursalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() sucursal!: Sucursal;
  /** Si se indica, solo muestra los tipos de dispositivo asociados a esa área (ej. '2' AV, '1' TI) */
  @Input() idArea?: string;

  dispositivosSucursal: DispositivosSucursal = {
    idSucursal: '',
    dispositivos: [],
  };

  tiposDisponibles: TipoDispositivo[] = [];
  estatusLista: EstatusTPV[] = [];
  isLoading: boolean = true;
  guardando: boolean = false;
  usuario: Usuario | null = null;

  // Estado del modal PrimeNG (crear / editar / ver)
  mostrarModalDispositivo: boolean = false;
  esNuevoDispositivo: boolean = true;
  formDispositivo: Dispositivo = new Dispositivo();

  private dispositivosSub?: Subscription;
  private estatusSub?: Subscription;

  constructor(
    private estatusService: StatusTpvsDevicesService,
    private dispositivosSucursalesService: DispositivosSucursalesService,
    private cdr: ChangeDetectorRef,
    @Optional() private messageService?: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarioSesion();
    this.actualizarTiposDisponibles();

    this.estatusSub = this.estatusService.estatus$.subscribe((estatus) => {
      this.estatusLista = estatus || [];
      this.isLoading = false;
      this.cdr.detectChanges();
    });

    this.cargarDispositivos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idArea']) {
      this.actualizarTiposDisponibles();
    }
    if (changes['sucursal'] && !changes['sucursal'].firstChange) {
      this.cargarDispositivos();
    }
  }

  ngOnDestroy(): void {
    this.dispositivosSub?.unsubscribe();
    this.estatusSub?.unsubscribe();
  }

  private cargarUsuarioSesion(): void {
    try {
      const raw = localStorage.getItem('rwuserdatatk');
      this.usuario = raw ? JSON.parse(raw) : null;
    } catch {
      this.usuario = null;
    }
  }

  private actualizarTiposDisponibles(): void {
    this.tiposDisponibles = obtenerTiposDispositivoPorArea(this.idArea);
  }

  get puedeGestionar(): boolean {
    const idRol = String(this.usuario?.idRol ?? '').trim();
    return idRol === '1' || idRol === '4' || idRol === '5';
  }

  get tipoSeleccionadoModal(): TipoDispositivo | undefined {
    return (
      obtenerTipoDispositivoPorId(this.formDispositivo.tipoId) ||
      this.tiposDisponibles[0]
    );
  }

  get tituloModal(): string {
    const singular = this.tipoSeleccionadoModal?.nombreSingular || 'Dispositivo';
    if (!this.puedeGestionar) return `Detalle de ${singular}`;
    return this.esNuevoDispositivo ? `Agregar ${singular}` : `Editar ${singular}`;
  }

  tieneCampoOpcional(campo: CampoOpcionalDispositivo): boolean {
    const tipo = this.tipoSeleccionadoModal;
    if (!tipo) return true;
    return tipo.camposOpcionales.includes(campo);
  }

  cargarDispositivos(): void {
    if (!this.sucursal?.id) return;

    this.dispositivosSub?.unsubscribe();
    const idStr = String(this.sucursal.id).trim();

    this.dispositivosSub = this.dispositivosSucursalesService
      .getBySucursalId(idStr)
      .subscribe({
        next: (data) => {
          this.dispositivosSucursal = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar dispositivos de la sucursal:', err);
          this.cdr.detectChanges();
        },
      });
  }

  obtenerDispositivosPorTipo(tipoId: string): Dispositivo[] {
    return this.dispositivosSucursalesService.obtenerPorTipo(this.dispositivosSucursal, tipoId);
  }

  getColorEstatus(idEstatus: string): string {
    const estatus = this.estatusLista.find((e) => e.id === idEstatus);
    return estatus ? estatus.color : '#94a3b8';
  }

  getNombreEstatus(idEstatus: string): string {
    const estatus = this.estatusLista.find((e) => e.id === idEstatus);
    return estatus ? estatus.nombre : 'Sin estatus';
  }

  obtenerMetaDispositivo(dispositivo: Dispositivo): string {
    const partes = [dispositivo.marca, dispositivo.pulgadas, dispositivo.modelo]
      .map((v) => (v || '').trim())
      .filter(Boolean);
    return partes.join(' · ');
  }

  abrirModalCrear(tipo: TipoDispositivo): void {
    if (!this.puedeGestionar) return;

    this.esNuevoDispositivo = true;
    this.formDispositivo = new Dispositivo(tipo.id);
    this.formDispositivo.estatus = this.estatusLista[0]?.id || '1';
    this.mostrarModalDispositivo = true;
    this.cdr.detectChanges();
  }

  abrirModalDetalleOEdicion(dispositivo: Dispositivo): void {
    this.esNuevoDispositivo = false;
    this.formDispositivo = { ...dispositivo };
    this.mostrarModalDispositivo = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.mostrarModalDispositivo = false;
    this.cdr.detectChanges();
  }

  async guardarDispositivo(): Promise<void> {
    if (!this.puedeGestionar || this.guardando) return;

    const nombreLimpio = (this.formDispositivo.nombre || '').trim();
    if (!nombreLimpio) {
      this.notificar('warn', 'Campo requerido', 'Ingresa un nombre para identificar el dispositivo.');
      return;
    }

    if (!this.formDispositivo.tipoId) {
      this.notificar('warn', 'Campo requerido', 'Selecciona el tipo de dispositivo.');
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const listaActual = [...(this.dispositivosSucursal.dispositivos || [])];
    const registro: Dispositivo = {
      ...this.formDispositivo,
      id: this.formDispositivo.id || new Dispositivo(this.formDispositivo.tipoId).id,
      nombre: nombreLimpio,
      estatus: this.formDispositivo.estatus || '1',
      eliminado: false,
      pulgadas: this.tieneCampoOpcional('pulgadas')
        ? (this.formDispositivo.pulgadas || '').trim()
        : '',
    };

    if (this.esNuevoDispositivo) {
      listaActual.push(registro);
    } else {
      const index = listaActual.findIndex((d) => d.id === registro.id);
      if (index >= 0) {
        listaActual[index] = registro;
      } else {
        listaActual.push(registro);
      }
    }

    const payload: DispositivosSucursal = {
      id: String(this.sucursal.id).trim(),
      idSucursal: String(this.sucursal.id).trim(),
      dispositivos: listaActual,
    };

    try {
      await this.dispositivosSucursalesService.saveOrUpdate(payload);
      this.dispositivosSucursal = payload;
      this.mostrarModalDispositivo = false;
      this.notificar(
        'success',
        this.esNuevoDispositivo ? 'Dispositivo registrado' : 'Dispositivo actualizado',
        `"${registro.nombre}" se guardó correctamente.`
      );
    } catch (error) {
      console.error('Error al guardar dispositivo en dispositivos-sucursal:', error);
      this.notificar('error', 'Error al guardar', 'No se pudo guardar el dispositivo. Intenta de nuevo.');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  async eliminarDispositivo(dispositivo: Dispositivo, event: Event): Promise<void> {
    event.stopPropagation();
    if (!this.puedeGestionar) return;

    const confirmacion = await Swal.fire({
      title: '¿Eliminar dispositivo?',
      text: `Se eliminará "${dispositivo.nombre}" de esta sucursal.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        container: 'swal-topmost',
      },
    });

    if (!confirmacion.isConfirmed) return;

    const listaActual = [...(this.dispositivosSucursal.dispositivos || [])];
    const index = listaActual.findIndex((d) => d.id === dispositivo.id);
    if (index === -1) return;

    listaActual.splice(index, 1);

    const payload: DispositivosSucursal = {
      id: String(this.sucursal.id).trim(),
      idSucursal: String(this.sucursal.id).trim(),
      dispositivos: listaActual,
    };

    try {
      await this.dispositivosSucursalesService.saveOrUpdate(payload);
      this.dispositivosSucursal = payload;
      this.notificar('success', 'Dispositivo eliminado', `"${dispositivo.nombre}" fue eliminado.`);
    } catch (error) {
      console.error('Error al eliminar dispositivo:', error);
      this.notificar('error', 'Error', 'No se pudo eliminar el dispositivo.');
    } finally {
      this.cdr.detectChanges();
    }
  }

  trackByTipoId(_index: number, tipo: TipoDispositivo): string {
    return tipo.id;
  }

  trackByDispositivoId(_index: number, dispositivo: Dispositivo): string {
    return dispositivo.id;
  }

  private notificar(severity: 'success' | 'warn' | 'error' | 'info', summary: string, detail: string): void {
    if (this.messageService) {
      this.messageService.add({ severity, summary, detail, life: 3200 });
      return;
    }
    Swal.fire({
      icon: severity === 'warn' ? 'warning' : severity,
      title: summary,
      text: detail,
      confirmButtonColor: '#D3152A',
      customClass: { container: 'swal-topmost' },
    });
  }
}
