import { CommonModule, registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import localeEs from '@angular/common/locales/es';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';

import { Ticket } from '../../../models/ticket.model';
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
import { DatesHelperService } from '../../../helpers/dates-helper.service';

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

  constructor(
    private ticketsService: TicketsService,
    private mantenimientoFactory: MantenimientoFactoryService,
    private cdr: ChangeDetectorRef,
    private datesHelper: DatesHelperService
  ) {
    registerLocaleData(localeEs);
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  async ngOnInit() {
    this.obtenerTickets();
    const servicio = this.mantenimientoFactory.getService(this.usuarioSeleccionado.idArea);
    await servicio.getMantenimientosPorSucursalYFecha([this.sucursal.id], this.fecha).subscribe((result: any) => {
      let data = result.filter((element: any) => element.length > 0);
      this.mantenimientosDelDia = [];
      for (let itemdata of data) {
        for (let item of itemdata) {
          this.mantenimientosDelDia.push(item);
        }
      }

      this.mantenimientosDelDia = this.mantenimientosDelDia.map(x => {
        x.fecha = this.datesHelper.getDate(x.fecha);
        return x;
      });

      this.cdr.detectChanges();
    });
  }

  onHide = () => this.closeEvent.emit();

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.clickEvent.emit(ticket);
    this.showModalTicketDetail = true;
  }

  abrirModalDetalleMantenimiento(mantenimiento: any) {
    this.mantenimiento = mantenimiento;
    this.mostrarModalDetalleMantenimeinto = true;
  }

  async obtenerTickets() {
    this.loading = true;

    const tickets1 = await this.ticketsService.getByIds(this.sucursal.idsTickets);

    const tickets2 = await this.ticketsService
      .getFinalizedTicketsByEndDate(
        this.fecha,
        this.usuarioSeleccionado.idArea
      );

      console.log(tickets1)
      console.log(tickets2)

      this.tickets = tickets2

    this.loading = false;
    this.cdr.detectChanges();
  }
}
