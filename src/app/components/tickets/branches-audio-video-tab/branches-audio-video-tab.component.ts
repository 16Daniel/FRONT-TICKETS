import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';

import { Sucursal } from '../../../models/sucursal.model';
import { Ticket } from '../../../models/ticket.model';
import { Usuario } from '../../../models/usuario.model';
import { Area } from '../../../models/area';
import { ModalGenerateTicketComponent } from '../../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketDetailComponent } from '../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';
import { ModalTicketsHistoryComponent } from '../../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { PriorityTicketsAccordionComponent } from '../priority-tickets-accordion/priority-tickets-accordion.component';
import { ModalBranchRatingComponent } from '../../../modals/branch/modal-branch-rating/modal-branch-rating.component';
import { Mantenimiento6x6AV } from '../../../models/mantenimiento-6x6-av.model';
import { Maintenance6x6AvService } from '../../../services/maintenance-6x6-av.service';
import { ModalMaintenanceAvHistoryComponent } from '../../../modals/maintenance/audio-video/modal-maintenance-av-history/modal-maintenance-av-history.component';
import { ModalMaintenanceAvCheckComponent } from '../../../modals/maintenance/audio-video/modal-maintenance-av-check/modal-maintenance-av-check.component';

@Component({
  selector: 'app-branches-audio-video-tab',
  standalone: true,
  imports: [
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ModalGenerateTicketComponent,
    ModalTicketDetailComponent,
    ModalTicketsHistoryComponent,
    PriorityTicketsAccordionComponent,
    ModalBranchRatingComponent,
    ModalMaintenanceAvHistoryComponent,
    ModalMaintenanceAvCheckComponent
  ],
  templateUrl: './branches-audio-video-tab.component.html',
  styleUrl: './branches-audio-video-tab.component.scss'
})
export class BranchesAudioVideoTabComponent {
  @Input() tickets: Ticket[] = [];

  mostrarModalGenerateTicket: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarModalRating: boolean = false;
  mostrarModalHistorialMantenimientos: boolean = false;
  mostrarModalMantenimiento: boolean = false;
  mantenimientoActivo: Mantenimiento6x6AV | null = null;

  sucursal: Sucursal | undefined;
  todosLosTickets: Ticket[] = [];
  areas: Area[] = [];
  usuario: Usuario;
  loading: boolean = false;
  subscripcionTicket: Subscription | undefined;
  ticket: Ticket | undefined;

  private unsubscribe!: () => void;

  constructor(
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private mantenimientoService: Maintenance6x6AvService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
    this.obtenerMantenimientoActivo();
  }

  ngOnDestroy() {
    if (this.subscripcionTicket != undefined) {
      this.subscripcionTicket.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.ticket = ticket;
    this.mostrarModalTicketDetail = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show'); // Cierra todas las secciones del accordion
      });
    }, 50);
  }

  verificarTicketsPorValidar(tickets: Ticket[]) {
    let result = tickets.filter(x => x.idEstatusTicket == '7');
    return result.length > 0;
  }

  onClickGenerarTicket() {
    if (this.verificarTicketsPorValidar(this.todosLosTickets)) {
      this.confirmationService.confirm({
        header: 'IMPORTANTE',
        message: `TIENES TICKETS PENDIENTES POR VALIDAR`,
        acceptLabel: 'Aceptar',
        acceptButtonStyleClass: 'btn bg-p-b p-3',
        rejectButtonStyleClass: 'btn btn-light me-3 p-3',
        rejectVisible: false,
        accept: () => {
        },
      });
    }
    else {
      this.mostrarModalGenerateTicket = true;
    }
  }

  mostrarAlertaMantenimiento() {
    this.confirmationService.confirm({
      header: 'IMPORTANTE',
      message: `
      TIENES QUE VALIDAR LAS CONDICIONES FINALES EN LAS QUE EL ANALISTA TE ESTÁ ENTREGANDO LA SUCURSAL
      <br><br>
      ES UNA EVALUACIÓN DE MANTENIMIENTO DE AUDIO Y VIDEO EN 6 PUNTOS
      <br><br>
      CADA UNO DE TUS CHECKS INDICAN QUE SE TE ESTÁ ENTREGANDO EN ÓPTIMAS CONDICIONES LA SUCURSAL, Y NOS DARA PAUTA PARA AGENDAR EL PRÓXIMO MANTENIMIENTO`,
      acceptLabel: 'Aceptar', // 🔥 Cambia "Yes" por "Aceptar"
      rejectLabel: 'Cancelar', // 🔥 Cambia "No" por "Cancelar"
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
        this.mostrarModalMantenimiento = true;
      },
      reject: () => { },
    });
  }

  async obtenerMantenimientoActivo() {
    this.unsubscribe = this.mantenimientoService.getMantenimientoActivo(
      this.sucursal?.id,
      (mantenimiento) => {
        this.mantenimientoActivo = mantenimiento;
        this.cdr.detectChanges();
      }
    );
  }
}
