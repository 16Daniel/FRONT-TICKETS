import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { Usuario } from '../../../../usuarios/interfaces/usuario.model';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { UsersService } from '../../../../usuarios/services/users.service';
import { MantenimientoSysAv } from '../../../interfaces/mantenimiento-sys-av.interface';
import { TablaMantenimientosSysAvComponent } from "../../../components/tabla-mantenimientos-sys-av/tabla-mantenimientos-sys-av.component";
import { ModalMaintenanceDetailComponent } from "../../systems/modal-maintenance-detail/modal-maintenance-detail.component";

@Component({
  selector: 'app-historial-mantenimiento-sys-av-dialog',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    CalendarModule,
    FormsModule,
    TableModule,
    TablaMantenimientosSysAvComponent,
    ModalMaintenanceDetailComponent
],
  templateUrl: './historial-mantenimiento-sys-av-dialog.component.html',
  styleUrl: './historial-mantenimiento-sys-av-dialog.component.scss',
})
export class HistorialMantenimeintoSysAvComponent {
  @Input() showModalHistorialMantenimientos: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();
  mantenimientos: MantenimientoSysAv[] = [];
  usuario: Usuario;
  idSucursal: string;
  usuariosHelp: Usuario[] = [];
  mostrarModalDetalleMantenimeinto: boolean = false;
  mantenimiento: MantenimientoSysAv | any;
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

  abrirModalDetalleMantenimiento(mantenimiento: MantenimientoSysAv | any) {
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
    this.maintenance10x10Service.getHistorialMantenimeintosAV(
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
    this.maintenance10x10Service.getLastMaintenanceByBranchAV(this.idSucursal).subscribe(result => {
      this.mantenimientos = result;
    })
  }
}
