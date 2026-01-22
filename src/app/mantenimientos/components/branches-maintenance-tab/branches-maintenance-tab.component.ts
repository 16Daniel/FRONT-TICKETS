import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { ModalGenerateTicketComponent } from '../../../tickets/dialogs/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { ModalTicketsHistoryComponent } from '../../../tickets/dialogs/modal-tickets-history/modal-tickets-history.component';
import { PriorityTicketsAccordionComponent } from '../../../tickets/components/priority-tickets-accordion/priority-tickets-accordion.component';
import { ModalBranchRatingComponent } from '../../../tickets/components/modal-branch-rating/modal-branch-rating.component';
import { ModalMateinanceMttoCheckComponent } from '../../dialogs/manteinance/modal-mateinance-mtto-check/modal-mateinance-mtto-check.component';
import { ModalMaintenanceMttoHistoryComponent } from '../../dialogs/manteinance/modal-maintenance-mtto-history/modal-maintenance-mtto-history.component';
import { Ticket } from '../../../tickets/models/ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { MaintenanceMtooService } from '../../services/maintenance-mtto.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { MantenimientoMtto } from '../../interfaces/mantenimiento-mtto.model';

@Component({
  selector: 'app-branches-maintenance-tab',
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
    ModalMateinanceMttoCheckComponent,
    ModalMaintenanceMttoHistoryComponent
  ],
  templateUrl: './branches-maintenance-tab.component.html',
  styleUrl: './branches-maintenance-tab.component.scss'
})

export class BranchesMaintenanceTabComponent {
  @Input() tickets: Ticket[] = [];
  @Input() todosLosTickets: Ticket[] = [];
  @Input() esEspectadorActivo: boolean = false;

  mostrarModalGenerateTicket: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarModalManteinance: boolean = false;
  mostrarModalHistorialMantenimientos: boolean = false;
  mostrarModalRating: boolean = false;

  sucursal: Sucursal | undefined;
  mantenimientosActivos: MantenimientoMtto[] = [];
  areas: Area[] = [];
  usuario: Usuario;
  ticket: Ticket | undefined;

  private unsubscribe!: () => void;

  constructor(
    public cdr: ChangeDetectorRef,
    private mantenimientoService: MaintenanceMtooService,
    private confirmationService: ConfirmationService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    this.obtenerMantenimientosActivos();
  }

  ngOnDestroy(): void {
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

  obtenerNombreArea(idp: string): string {
    let nombre = '';
    let area = this.areas.filter((x) => x.id == idp);
    if (area.length > 0) {
      nombre = area[0].nombre;
    }
    return nombre;
  }

  filtrarTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  async obtenerMantenimientosActivos() {
    this.unsubscribe = this.mantenimientoService.getMantenimientosActivosPorFecha(
      this.sucursal?.id,
      (mantenimientos: MantenimientoMtto[]) => {
        this.mantenimientosActivos = mantenimientos;
        this.cdr.detectChanges();
      }
    );
  }

  mostrarAlerta() {
    this.confirmationService.confirm({
      header: 'IMPORTANTE',
      message: `
        TIENES QUE VALIDAR LAS CONDICIONES FINALES EN LAS QUE EL ANALISTA TE ESTÁ ENTREGANDO LA SUCURSAL
        <br><br>
        ES UNA EVALUACIÓN DE MANTENIMIENTO DE FREIDORAS EN 8 PUNTOS
        <br><br>
        CADA UNO DE TUS CHECKS INDICAN QUE SE TE ESTÁ ENTREGANDO EN ÓPTIMAS CONDICIONES LA SUCURSAL, Y NOS DARA PAUTA PARA AGENDAR EL PRÓXIMO MANTENIMIENTO`,
      acceptLabel: 'Aceptar', // 🔥 Cambia "Yes" por "Aceptar"
      rejectLabel: 'Cancelar', // 🔥 Cambia "No" por "Cancelar"
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
        this.mostrarModalManteinance = true;
      },
      reject: () => { },
    });
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
}
