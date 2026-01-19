import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { Usuario } from '../../../../models/usuario.model';
import { BranchMaintenanceTableMttoComponent } from '../../../../components/maintenance/maintenance/branch-maintenance-table-mtto/branch-maintenance-table-mtto.component';
import { MantenimientoMtto } from '../../../../models/mantenimiento-mtto.model';
import { MaintenanceMtooService } from '../../../../services/maintenance-mtto.service';
import { UsersService } from '../../../../services/users.service';

@Component({
  selector: 'app-modal-maintenance-mtto-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    CalendarModule,
    TableModule,
    BranchMaintenanceTableMttoComponent
  ], templateUrl: './modal-maintenance-mtto-history.component.html',
  styleUrl: './modal-maintenance-mtto-history.component.scss'
})
export class ModalMaintenanceMttoHistoryComponent {
  @Input() showModalHistorialMantenimientos: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();
  mantenimientos: MantenimientoMtto[] = [];
  usuario: Usuario;
  idSucursal: string;
  usuariosHelp: Usuario[] = [];
  mostrarModalDetalleMantenimeinto: boolean = false;
  mantenimiento: MantenimientoMtto | any;
  paginaCargaPrimeraVez: boolean = true;

  constructor(private maintenanceService: MaintenanceMtooService,
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

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerUsuariosHelp() {
    this.usersService.usuarios$.subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  obtenerUltimoMantenimiento() {
    this.maintenanceService.getLastMaintenanceByBranch(this.idSucursal).subscribe(result => {
      this.mantenimientos = result;
    })
  }

  buscar() {
    this.paginaCargaPrimeraVez = false;
    this.obtenerMantenimientosPorSucursal(this.idSucursal);
  }

  async obtenerMantenimientosPorSucursal(idSucursal: string): Promise<void> {
    this.maintenanceService.getHistorialMantenimeintos(
      this.fechaInicio,
      this.fechaFin,
      idSucursal,
      (mantenimientos: any) => {
        if (mantenimientos) {
          this.mantenimientos = mantenimientos; this.cdr.detectChanges();
        }
        else
          if (!this.paginaCargaPrimeraVez) this.showMessage('warn', 'Atención!', 'No se encontró información');
      }
    );
  }

  abrirModalDetalleMantenimiento(mantenimiento: MantenimientoMtto | any) {
    this.mantenimiento = mantenimiento;
    this.mostrarModalDetalleMantenimeinto = true;
  }
}
