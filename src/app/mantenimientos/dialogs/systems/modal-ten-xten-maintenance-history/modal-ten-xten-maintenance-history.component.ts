import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { ModalMaintenanceDetailComponent } from '../modal-maintenance-detail/modal-maintenance-detail.component';
import { Usuario } from '../../../../usuarios/interfaces/usuario.model';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { UsersService } from '../../../../usuarios/services/users.service';
import { MantenimientoSys } from '../../../interfaces/mantenimiento-sys.interface';
import { BranchMaintenanceTableComponent } from '../../../components/branch-maintenance-table/branch-maintenance-table.component';

@Component({
  selector: 'app-modal-ten-xten-maintenance-history',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    CalendarModule,
    FormsModule,
    TableModule,
    BranchMaintenanceTableComponent,
    ModalMaintenanceDetailComponent,
  ],
  templateUrl: './modal-ten-xten-maintenance-history.component.html',
  styleUrl: './modal-ten-xten-maintenance-history.component.scss',
})
export class ModalTenXtenMaintenanceHistoryComponent {
  @Input() showModalHistorialMantenimientos: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();
  mantenimientos: MantenimientoSys[] = [];
  usuario: Usuario;
  idSucursal: string;
  usuariosHelp: Usuario[] = [];
  mostrarModalDetalleMantenimeinto: boolean = false;
  mantenimiento: MantenimientoSys | any;
  paginaCargaPrimeraVez: boolean = true;

  constructor(
    private maintenance10x10Service: Maintenance10x10Service,
    private messageService: MessageService,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursal = this.usuario.sucursales[0].id;
    if (this.idSucursal) {
      this.obtenerUltimoMantenimiento();
    }
    this.obtenerUsuariosHelp();
  }

  abrirModalDetalleMantenimiento(mantenimiento: MantenimientoSys | any) {
    this.mantenimiento = mantenimiento;
    this.mostrarModalDetalleMantenimeinto = true;
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  buscar() {
    this.paginaCargaPrimeraVez = false;
    this.obtenerMantenimientosPorSucursal(this.idSucursal);
  }

  async obtenerMantenimientosPorSucursal(idSucursal: string): Promise<void> {
    this.maintenance10x10Service.getHistorialMantenimeintos(
      this.fechaInicio,
      this.fechaFin,
      idSucursal,
      (mantenimientos: any) => {
        if (mantenimientos) {

          this.mantenimientos = mantenimientos;

          this.cdr.detectChanges();
        } else {
          if (!this.paginaCargaPrimeraVez) {
            this.showMessage(
              'warn',
              'Atención!',
              'No se encontró información'
            );
          }

        }
      }
    );
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerUsuariosHelp() {
    this.usersService.usuarios$.subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  obtenerUltimoMantenimiento() {
    this.maintenance10x10Service.getLastMaintenanceByBranch(this.idSucursal).subscribe(result => {
      this.mantenimientos = result;
    })
  }
}
