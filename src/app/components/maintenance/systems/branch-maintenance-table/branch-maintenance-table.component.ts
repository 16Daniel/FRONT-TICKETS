import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { TableModule } from 'primeng/table';

import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../../models/usuario.model';
import { ModalFinalCommentsComponent } from '../../../../modals/maintenance/modal-final-comments/modal-final-comments.component';

@Component({
  selector: 'app-branch-maintenance-table',
  standalone: true,
  imports: [TableModule, CommonModule, ModalFinalCommentsComponent],
  templateUrl: './branch-maintenance-table.component.html',
})
export class BranchMaintenanceTableComponent {
  @Input() mantenimientos: Mantenimiento10x10[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Output() clickEvent = new EventEmitter<Mantenimiento10x10>();
  mantenimientoSeleccionado: Mantenimiento10x10 | undefined;
  mostrarModalComentarios: boolean = false;

  constructor() { }

  calcularPorcentaje(mantenimiento: Mantenimiento10x10) {
    let porcentaje = 0;
    mantenimiento.mantenimientoCaja ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoImpresoras ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoRack ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoPuntosVentaTabletas
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoContenidosSistemaCable
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoInternet ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoCCTV ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoNoBrakes ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoTiemposCocina ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoConcentradorApps
      ? (porcentaje += 10)
      : porcentaje;

    return porcentaje;
  }

  obtenerNombreResponsable(idUsuario: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == idUsuario);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    } catch {
      return tsmp;
    }
  }

  // onClick() {
  //   // this.clickEvent.emit(this.mantenimientoSeleccionado);
  //   this.mostrarModalComentarios = true;
  //   this.man
  // }
}
