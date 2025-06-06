import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { Sucursal } from '../../../models/sucursal.model';
import { Ticket } from '../../../models/ticket.model';
import { Usuario } from '../../../models/usuario.model';
import { Area } from '../../../models/area';
import { ModalGenerateTicketComponent } from '../../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketDetailComponent } from '../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';
import { ModalFilterTicketsComponent } from '../../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketsHistoryComponent } from '../../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { PriorityTicketsAccordionComponent } from '../priority-tickets-accordion/priority-tickets-accordion.component';
import { ModalBranchRatingComponent } from '../../../modals/branch/modal-branch-rating/modal-branch-rating.component';
import { ModalTenXtenMaintenanceCheckComponent } from '../../../modals/maintenance/systems/modal-ten-xten-maintenance-check/modal-ten-xten-maintenance-check.component';
import { ModalTenXtenMaintenanceHistoryComponent } from '../../../modals/maintenance/systems/modal-ten-xten-maintenance-history/modal-ten-xten-maintenance-history.component';

@Component({
  selector: 'app-branches-sys-tab',
  standalone: true,
  imports: [
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    ModalGenerateTicketComponent,
    ModalTicketDetailComponent,
    ModalFilterTicketsComponent,
    ModalTicketsHistoryComponent,
    ModalTenXtenMaintenanceCheckComponent,
    ModalTenXtenMaintenanceHistoryComponent,
    PriorityTicketsAccordionComponent,
    ModalBranchRatingComponent
  ],
  templateUrl: './branches-sys-tab.component.html',
  styleUrl: './branches-sys-tab.component.scss',
})

export class BranchesSysTabComponent {
  @Input() tickets: Ticket[] = [];
  @Input() todosLosTickets: Ticket[] = [];
  @Input() esEspectadorActivo: boolean = false;

  mostrarModalGenerateTicket: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarModal10x10: boolean = false;
  mostrarModalHistorialMantenimientos: boolean = false;
  mostrarModalRating: boolean = false;

  sucursal: Sucursal | undefined;
  mantenimientoActivo: Mantenimiento10x10 | null = null;
  areas: Area[] = [];
  usuario: Usuario;
  ticket: Ticket | undefined;

  private unsubscribe!: () => void;

  constructor(
    public cdr: ChangeDetectorRef,
    private mantenimientoService: Maintenance10x10Service,
    private confirmationService: ConfirmationService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    this.obtenerMantenimientoActivo();
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['esEspectadorActivo']) {
      const prev = changes['esEspectadorActivo'].previousValue;
      const curr = changes['esEspectadorActivo'].currentValue;
      console.log(`esEspectadorActivo cambió de ${prev} a ${curr}`);

      // Aquí pones la lógica que quieres que se ejecute cuando cambie
      this.onEspectadorActivoChanged(curr);
      this.cdr.detectChanges();
    }
  }

  onEspectadorActivoChanged(nuevoValor: boolean) {
    console.log('Nuevo valor de esEspectadorActivo:', nuevoValor);
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

  async obtenerMantenimientoActivo() {
    this.unsubscribe = this.mantenimientoService.getMantenimientoActivo(
      this.sucursal?.id,
      (mantenimiento) => {
        console.log(mantenimiento)
        this.mantenimientoActivo = mantenimiento;
        this.cdr.detectChanges();
        // console.log('Mantenimiento activo:', this.mantenimientoActivo);
      }
    );
  }

  mostrarAlerta10x10() {
    this.confirmationService.confirm({
      header: 'IMPORTANTE',
      message: `
      TIENES QUE VALIDAR LAS CONDICIONES FINALES EN LAS QUE EL ANALISTA TE ESTÁ ENTREGANDO LA SUCURSAL
      <br><br>
      ES UNA EVALUACIÓN DE MANTENIMIENTO DE SISTEMAS EN 10 PUNTOS
      <br><br>
      CADA UNO DE TUS CHECKS INDICAN QUE SE TE ESTÁ ENTREGANDO EN ÓPTIMAS CONDICIONES LA SUCURSAL, Y NOS DARA PAUTA PARA AGENDAR EL PRÓXIMO MANTENIMIENTO`,
      acceptLabel: 'Aceptar', // 🔥 Cambia "Yes" por "Aceptar"
      rejectLabel: 'Cancelar', // 🔥 Cambia "No" por "Cancelar"
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
        this.mostrarModal10x10 = true;
      },
      reject: () => { },
    });
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
}
