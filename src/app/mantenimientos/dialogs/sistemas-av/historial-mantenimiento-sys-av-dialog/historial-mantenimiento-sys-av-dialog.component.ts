import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

import { Usuario } from '../../../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../../../usuarios/services/users.service';
import { MantenimientoAudioVideo } from '../../../interfaces/mantenimiento-audio-video.interface';
import { ModalMaintenanceDetailComponent } from "../../systems/modal-maintenance-detail/modal-maintenance-detail.component";
import { MaintenanceAvService } from '../../../services/maintenance-av.service';
import { TablaMantenimientosAudioVideoComponent } from "../../../components/tabla-mantenimientos-audio-video/tabla-mantenimientos-audio-video.component";

@Component({
  selector: 'app-historial-mantenimiento-sys-av-dialog',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    CalendarModule,
    FormsModule,
    TableModule,
    ModalMaintenanceDetailComponent,
    TablaMantenimientosAudioVideoComponent
],
  templateUrl: './historial-mantenimiento-sys-av-dialog.component.html',
  styleUrl: './historial-mantenimiento-sys-av-dialog.component.scss',
})
export class HistorialMantenimeintoSysAvComponent {
  @Input() showModalHistorialMantenimientos: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();
  mantenimientos: MantenimientoAudioVideo[] = [];
  usuario: Usuario;
  idSucursal: string;
  usuariosHelp: Usuario[] = [];
  mostrarModalDetalleMantenimeinto: boolean = false;
  mantenimiento: MantenimientoAudioVideo | any;
  paginaCargaPrimeraVez: boolean = true;

  constructor(
    private maintenanceAvService: MaintenanceAvService,
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

  abrirModalDetalleMantenimiento(mantenimiento: MantenimientoAudioVideo | any) {
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
    this.maintenanceAvService.getHistorialMantenimeintos(
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
    this.maintenanceAvService.getLastMaintenanceByBranch(this.idSucursal).subscribe(result => {
      this.mantenimientos = result;
    })
  }
}
