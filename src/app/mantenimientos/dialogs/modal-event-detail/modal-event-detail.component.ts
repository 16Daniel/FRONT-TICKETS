import { CommonModule, registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import localeEs from '@angular/common/locales/es';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';

import { RequesterTicketsListComponent } from '../../../tickets/components/requester-tickets-list/requester-tickets-list.component';
import { BranchMaintenanceTableComponent } from '../../components/systems/branch-maintenance-table/branch-maintenance-table.component';
import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { ModalMaintenanceDetailComponent } from '../systems/modal-maintenance-detail/modal-maintenance-detail.component';
import { BranchMaintenanceTableAvComponent } from '../../components/audio-video/branch-maintenance-table-av/branch-maintenance-table-av.component';
import { BranchMaintenanceTableMttoComponent } from '../../components/maintenance/branch-maintenance-table-mtto/branch-maintenance-table-mtto.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { SucursalProgramada } from '../../interfaces/sucursal-programada.model';

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
  @Input() verFinzalizadosHoy: boolean = true;
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

    try {
      const ticketsAsignados = await this.ticketsService.getByIds(this.sucursal.idsTickets);

      const ticketsExtrasFinzalizadosHoy = await this.ticketsService.getFinalizedTicketsByEndDate(
        this.fecha,
        this.usuarioSeleccionado.idArea,
        this.sucursal.id
      );

      const idsExistentes = new Set(ticketsAsignados.map(t => t.id));

      if (this.verFinzalizadosHoy) {
        const nuevosTickets = ticketsExtrasFinzalizadosHoy.filter(t => !idsExistentes.has(t.id));
        this.tickets = [...ticketsAsignados, ...nuevosTickets];
      }
      else {
        this.tickets = [...ticketsAsignados];
      }

    } catch (error) {
      console.error('Error al obtener tickets:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

}
