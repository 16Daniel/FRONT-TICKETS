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
import { MessageService } from 'primeng/api';
import { UsersService } from '../../../services/users.service';
import { BranchMaintenanceTableComponent } from "../../../components/maintenance/branch-maintenance-table/branch-maintenance-table.component";

@Component({
  selector: 'app-modal-ten-xten-maintenance-history',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    CalendarModule,
    FormsModule,
    TableModule,
    BranchMaintenanceTableComponent
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
  idSucursal: string;
  usuariosHelp: Usuario[] = [];

  constructor(
    private maintenance10x10Service: Maintenance10x10Service,
    private messageService: MessageService,
    private usersService: UsersService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursal = this.usuario.sucursales[0].id;
    this.obtenerMantenimientosPorSucursal(this.idSucursal);
    this.obtenerUsuariosHelp();
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  buscar() {
    this.obtenerMantenimientosPorSucursal(this.idSucursal);
  }

  async obtenerMantenimientosPorSucursal(idSucursal: string): Promise<void> {
    this.maintenance10x10Service.getHistorialMantenimeintos(
      this.fechaInicio,
      this.fechaFin,
      idSucursal,
      (mantenimientos: any) => {
        if (mantenimientos) {
          this.showMessage('success', 'Success', 'Información localizada');
          this.mantenimientos = mantenimientos;
          // this.cdr.detectChanges();
        } else {
          this.showMessage(
            'warning',
            'Atención!',
            'No se encontró información'
          );
        }
      }
    );
  }


  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }


  obtenerUsuariosHelp() {
    this.usersService.getusers().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        // this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }


}
