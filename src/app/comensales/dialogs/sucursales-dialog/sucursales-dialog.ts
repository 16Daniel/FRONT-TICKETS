import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

import { sucursalesComensales } from '../../models/sucursales-comensales.model';
import { ComensalesService } from '../../services/comensales.service';

@Component({
  selector: 'app-sucursales-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, TableModule, TooltipModule],
  templateUrl: './sucursales-dialog.html',
  styleUrl: './sucursales-dialog.scss',
})
export class SucursalesDialog implements OnInit, OnDestroy {
  @Input() verModalSucursales: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  formnombreSucursal: string = '';
  public sucursalesComensalesdata: sucursalesComensales[] = [];
  public guardando: boolean = false;

  private sucursalesSub?: Subscription;

  constructor(
    public comensalesService: ComensalesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerSucursales();
  }

  ngOnDestroy(): void {
    this.sucursalesSub?.unsubscribe();
  }

  async agregarSucursal(): Promise<void> {
    const nombreLimpio = (this.formnombreSucursal || '').trim().toUpperCase();
    if (!nombreLimpio || this.guardando) return;

    this.guardando = true;
    this.cdr.detectChanges();

    try {
      const data: sucursalesComensales = { nombre: nombreLimpio };
      await this.comensalesService.agregarSucursal(data);
      this.formnombreSucursal = '';
      Swal.fire({
        title: 'Agregada',
        text: 'Sucursal de competencia registrada correctamente.',
        icon: 'success',
        timer: 1700,
        showConfirmButton: false,
        customClass: { container: 'swal-topmost' },
      });
    } catch (error) {
      console.error('Error al agregar sucursal de competencia:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo registrar la sucursal.',
        icon: 'error',
        customClass: { container: 'swal-topmost' },
      });
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  obtenerSucursales(): void {
    this.sucursalesSub?.unsubscribe();
    this.sucursalesSub = this.comensalesService.obtenerSucursales().subscribe({
      next: (data) => {
        this.sucursalesComensalesdata = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener sucursales de competencia:', error);
      },
    });
  }

  onHide(): void {
    this.closeEvent.emit(false);
  }

  confirmacionEliminar(id: string): void {
    Swal.fire({
      title: '¿Está segur@ que desea eliminar?',
      text: 'Se eliminará esta sucursal del catálogo de competencia.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: { container: 'swal-topmost' },
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarSucursal(id);
      }
    });
  }

  async eliminarSucursal(id: string): Promise<void> {
    await this.comensalesService.borrarSucursal(id);
    Swal.fire({
      title: 'Eliminada',
      text: 'Sucursal eliminada correctamente.',
      icon: 'success',
      timer: 1700,
      showConfirmButton: false,
      customClass: { container: 'swal-topmost' },
    });
  }

  async actualizarNombre(item: sucursalesComensales): Promise<void> {
    const nombreLimpio = (item.nombre || '').trim().toUpperCase();
    if (!nombreLimpio || !item.id) return;

    item.nombre = nombreLimpio;
    await this.comensalesService.actualizarSucursal(item, item.id);
    Swal.fire({
      title: 'Actualizada',
      text: 'Nombre actualizado correctamente.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      customClass: { container: 'swal-topmost' },
    });
  }
}
