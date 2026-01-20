import { ChangeDetectorRef, Component, input, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';

import { ModalGenerateTicketComponent } from '../../../tickets/dialogs/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { ModalTicketsHistoryComponent } from '../../../tickets/dialogs/modal-tickets-history/modal-tickets-history.component';
import { PriorityTicketsAccordionComponent } from '../../../tickets/components/priority-tickets-accordion/priority-tickets-accordion.component';
import { ModalBranchRatingComponent } from '../../../tickets/components/modal-branch-rating/modal-branch-rating.component';
import { ModalMaintenanceAvHistoryComponent } from '../../dialogs/audio-video/modal-maintenance-av-history/modal-maintenance-av-history.component';
import { ModalMaintenanceAvCheckComponent } from '../../dialogs/audio-video/modal-maintenance-av-check/modal-maintenance-av-check.component';
import { Ticket } from '../../../tickets/models/ticket.model';
import { Area } from '../../../areas/models/area.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Maintenance6x6AvService } from '../../services/maintenance-av.service';
import { Mantenimiento6x6AV } from '../../interfaces/mantenimiento-av.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';

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
  @Input() esEspectadorActivo: boolean = false;
  @Input() todosLosTickets: Ticket[] = [];

  mostrarModalGenerateTicket: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarModalRating: boolean = false;
  mostrarModalHistorialMantenimientos: boolean = false;
  mostrarModalMantenimiento: boolean = false;
  mantenimientoActivo: Mantenimiento6x6AV | null = null;

  sucursal: Sucursal | undefined;
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['esEspectadorActivo']) {
      const prev = changes['esEspectadorActivo'].previousValue;
      const curr = changes['esEspectadorActivo'].currentValue;

      this.cdr.detectChanges();
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
    if (this.verificarTicketsPorValidar(this.tickets)) {
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
