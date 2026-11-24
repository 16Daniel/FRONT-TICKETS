import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';

@Component({
  selector: 'app-asignar-sucursales-aceite-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, MultiSelectModule, TooltipModule],
  templateUrl: './asignar-sucursales-aceite-dialog.component.html',
  styleUrl: './asignar-sucursales-aceite-dialog.component.scss',
})
export class AsignarSucursalesAceiteDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() visible: boolean = false;
  @Input() usuario: Usuario | null = null;
  @Input() sucursales: Sucursal[] = [];
  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() savedEvent = new EventEmitter<void>();

  public sucursalesOpciones: { id: string; nombre: string; controlDeAceite: boolean }[] = [];
  public sucursalesSeleccionadasIds: string[] = [];
  public guardando: boolean = false;

  private sucursalNombreMap: Record<string, string> = {};
  private usuarioSucursalSub?: Subscription;
  private seleccionInicialCargada: boolean = false;

  constructor(
    private usuarioSucursalService: UsuarioSucursalService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.usuarioSucursalService.initListener();
    this.construirOpcionesSucursales();
    this.suscribirRelaciones();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursales']) {
      this.construirOpcionesSucursales();
    }
    if (changes['usuario'] || changes['visible']) {
      this.seleccionInicialCargada = false;
      this.cargarSeleccionDesdeServicio();
    }
  }

  ngOnDestroy(): void {
    this.usuarioSucursalSub?.unsubscribe();
  }

  private construirOpcionesSucursales(): void {
    this.sucursalNombreMap = {};
    this.sucursalesOpciones = (this.sucursales || [])
      .filter((s) => s && s.id !== undefined && s.id !== null)
      .map((s) => {
        const idStr = String(s.id);
        this.sucursalNombreMap[idStr] = s.nombre || idStr;
        return {
          id: idStr,
          nombre: s.nombre || idStr,
          controlDeAceite: s.controlDeAceite === true,
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  private suscribirRelaciones(): void {
    this.usuarioSucursalSub?.unsubscribe();
    this.usuarioSucursalSub = this.usuarioSucursalService.usuarioSucursal$.subscribe(() => {
      if (!this.seleccionInicialCargada) {
        this.cargarSeleccionDesdeServicio();
      }
    });
  }

  private cargarSeleccionDesdeServicio(): void {
    if (!this.usuario?.id) {
      this.sucursalesSeleccionadasIds = [];
      return;
    }

    this.sucursalesSeleccionadasIds = this.usuarioSucursalService.obtenerSucursalesPorUsuario(
      'RECOLECCION_ACEITE',
      String(this.usuario.id),
      this.usuario.idArea
    );
    this.seleccionInicialCargada = true;
    this.cdr.detectChanges();
  }

  get nombreCompletoUsuario(): string {
    if (!this.usuario) return '';
    return [this.usuario.nombre, this.usuario.apellidoP, this.usuario.apellidoM]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  get inicialesUsuario(): string {
    if (!this.usuario) return 'U';
    const n = (this.usuario.nombre || '').trim().charAt(0);
    const a = (this.usuario.apellidoP || '').trim().charAt(0);
    return (n + a).toUpperCase() || 'U';
  }

  get totalHabilitadasAceite(): number {
    return this.sucursalesOpciones.filter((s) => s.controlDeAceite).length;
  }

  obtenerNombreSucursal(idSucursal: string): string {
    return this.sucursalNombreMap[idSucursal] || idSucursal;
  }

  quitarSucursal(idSucursal: string): void {
    this.sucursalesSeleccionadasIds = this.sucursalesSeleccionadasIds.filter(
      (id) => id !== idSucursal
    );
  }

  seleccionarSoloHabilitadas(): void {
    this.sucursalesSeleccionadasIds = this.sucursalesOpciones
      .filter((s) => s.controlDeAceite)
      .map((s) => s.id);
  }

  limpiarSeleccion(): void {
    this.sucursalesSeleccionadasIds = [];
  }

  onHide(): void {
    this.closeEvent.emit(false);
  }

  async guardar(): Promise<void> {
    if (!this.usuario?.id) return;

    const idArea = this.usuario.idArea ? String(this.usuario.idArea) : '';
    if (!idArea) {
      await Swal.fire({
        title: 'Área requerida',
        text: 'Este usuario no tiene un área asignada. Asigna su área en el módulo de Usuarios antes de vincular sucursales.',
        icon: 'warning',
        confirmButtonColor: '#D3152A',
        customClass: { container: 'swal-topmost' },
      });
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    try {
      await this.usuarioSucursalService.guardarSucursalesDeUsuario(
        'RECOLECCION_ACEITE',
        idArea,
        String(this.usuario.id),
        this.sucursalesSeleccionadasIds
      );

      this.savedEvent.emit();
      this.closeEvent.emit(false);
    } catch (error) {
      console.error('Error al guardar sucursales de recolección de aceite:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudieron guardar las sucursales asignadas.',
        icon: 'error',
        confirmButtonColor: '#D3152A',
        customClass: { container: 'swal-topmost' },
      });
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }
}
