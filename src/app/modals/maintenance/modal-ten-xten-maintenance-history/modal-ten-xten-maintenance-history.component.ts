import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../models/usuario.model';
import { TableModule } from 'primeng/table';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-modal-ten-xten-maintenance-history',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    CalendarModule,
    FormsModule,
    TableModule,
  ],
  templateUrl: './modal-ten-xten-maintenance-history.component.html',
  styleUrl: './modal-ten-xten-maintenance-history.component.scss',
})
export class ModalTenXtenMaintenanceHistoryComponent {
  @Input() showModalHistorialMantenimientos: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();
  mantenimientos: Mantenimiento10x10[] = [];
  usuario: Usuario;
  mantenimientoSeleccionado: Mantenimiento10x10 | undefined;

  constructor(private maintenance10x10Service: Maintenance10x10Service) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idSucursal = this.usuario.sucursales[0].id;
    console.log(idSucursal);
    this.obtenerTicketsPorUsuario(parseInt(idSucursal));
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  buscar() {
    // this.obtenerTicketsPorUsuario(this.userdata.uid);
  }

  async obtenerTicketsPorUsuario(idSucursal: number): Promise<void> {
    this.maintenance10x10Service.getHistorialMantenimeintos(
      this.fechaInicio,
      this.fechaFin,
      idSucursal,
      (mantenimientos: any) => {
        console.log(mantenimientos);
        this.mantenimientos = mantenimientos;
        // this.cdr.detectChanges();
      }
    );
  }

  onClick() {}

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
}
