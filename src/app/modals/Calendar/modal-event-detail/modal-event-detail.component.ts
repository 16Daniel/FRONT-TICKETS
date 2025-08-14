import { CommonModule, registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import localeEs from '@angular/common/locales/es';
import { Timestamp } from '@angular/fire/firestore';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';

import { Ticket } from '../../../models/ticket.model';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../models/usuario.model';
import { ModalTicketDetailComponent } from "../../tickets/modal-ticket-detail/modal-ticket-detail.component";
import { TicketsService } from '../../../services/tickets.service';
import { SucursalProgramada } from '../../../models/sucursal-programada.model';
import { BranchMaintenanceTableComponent } from '../../../components/maintenance/systems/branch-maintenance-table/branch-maintenance-table.component';
import { ModalMaintenanceDetailComponent } from '../../maintenance/systems/modal-maintenance-detail/modal-maintenance-detail.component';
import { BranchMaintenanceTableAvComponent } from '../../../components/maintenance/audio-video/branch-maintenance-table-av/branch-maintenance-table-av.component';
import { BranchMaintenanceTableMttoComponent } from '../../../components/maintenance/maintenance/branch-maintenance-table-mtto/branch-maintenance-table-mtto.component';
import { MantenimientoFactoryService } from '../../../services/maintenance-factory.service';
import { RequesterTicketsListComponent } from '../../../components/requester-tickets-list/requester-tickets-list.component';

@Component({
  selector: 'app-modal-event-detail',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    FormsModule,
    RequesterTicketsListComponent,
    BranchMaintenanceTableComponent,
    EditorModule,
    ModalTicketDetailComponent,
    ModalMaintenanceDetailComponent,
    BranchMaintenanceTableAvComponent,
    BranchMaintenanceTableMttoComponent
  ],
  templateUrl: './modal-event-detail.component.html',
})

export default class ModalEventDetailComponent implements OnInit {
  @Input() showModalEventeDetail: boolean = false;
  @Input() sucursal: SucursalProgramada | any;
  @Input() fecha: Date | any;
  @Input() usuariosHelp: Usuario[] = [];
  @Input() usuarioSeleccionado: Usuario | any;
  // @Input() Indicacion: string = '';
  @Input() comentario: string = '';
  @Input() idsTickets: string[] = [];
  @Output() clickEvent = new EventEmitter<Ticket>();
  @Output() closeEvent = new EventEmitter<boolean>();

  tickets: Ticket[] = [];
  showModalTicketDetail: boolean = false;
  itemtk: Ticket | undefined;
  mostrarModalDetalleMantenimeinto: boolean = false;
  mantenimiento: any;
  loading: boolean = true;
  usuario: Usuario;
  mantenimientosDelDia: any[] = [];
  // usuarioSoporte: Usuario;

  constructor(
    private ticketsService: TicketsService,
    private mantenimientoFactory: MantenimientoFactoryService,
    private cdr: ChangeDetectorRef,
  ) {
    registerLocaleData(localeEs);
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);

    // this.usuarioSoporte = this.usuariosHelp.filter(x => x.id == '')[0];

  }

  async ngOnInit() {
    this.obtenerTickets();
    const servicio = this.mantenimientoFactory.getService(this.usuarioSeleccionado.idArea);
    await servicio.getUltimosMantenimientos([this.sucursal.id]).subscribe((result: any) => {
      this.mantenimientosDelDia = result;
      this.cdr.detectChanges();
    });
  }

  getDate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.clickEvent.emit(ticket);
    this.showModalTicketDetail = true;
  }

  abrirModalDetalleMantenimiento(mantenimiento: Mantenimiento10x10 | any) {
    this.mantenimiento = mantenimiento;
    this.mostrarModalDetalleMantenimeinto = true;
  }

  async obtenerTickets() {
    this.loading = true;
    this.tickets = await this.ticketsService.getByIds(this.sucursal.idsTickets);
    this.loading = false;
    this.cdr.detectChanges();
  }
}
