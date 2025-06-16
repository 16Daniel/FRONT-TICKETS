import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Mantenimiento6x6AV } from '../../../../models/mantenimiento-av.model';
import { Usuario } from '../../../../models/usuario.model';
import { Maintenance6x6AvService } from '../../../../services/maintenance-av.service';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../../../services/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { BranchMaintenanceTableAvComponent } from '../../../../components/maintenance/audio-video/branch-maintenance-table-av/branch-maintenance-table-av.component';

@Component({
  selector: 'app-modal-maintenance-av-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    CalendarModule,
    TableModule,
    BranchMaintenanceTableAvComponent
  ],
  templateUrl: './modal-maintenance-av-history.component.html',
  styleUrl: './modal-maintenance-av-history.component.scss'
})
export class ModalMaintenanceAvHistoryComponent {
  @Input() showModalHistorialMantenimientos: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();
  mantenimientos: Mantenimiento6x6AV[] = [];
  usuario: Usuario;
  idSucursal: string;
  usuariosHelp: Usuario[] = [];
  mostrarModalDetalleMantenimeinto: boolean = false;
  mantenimiento: Mantenimiento6x6AV | any;
  paginaCargaPrimeraVez: boolean = true;

  constructor(private maintenanceService: Maintenance6x6AvService,
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
    this.usersService.get().subscribe({
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

  abrirModalDetalleMantenimiento(mantenimiento: Mantenimiento6x6AV | any) {
    this.mantenimiento = mantenimiento;
    this.mostrarModalDetalleMantenimeinto = true;
  }
}
