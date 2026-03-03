import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { ModalGenerateTicketComponent } from '../../../tickets/dialogs/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { ModalFilterTicketsComponent } from '../../../tickets/dialogs/modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketsHistoryComponent } from '../../../tickets/dialogs/modal-tickets-history/modal-tickets-history.component';
import { PriorityTicketsAccordionComponent } from '../../../tickets/components/priority-tickets-accordion/priority-tickets-accordion.component';
import { ModalBranchRatingComponent } from '../../../tickets/components/modal-branch-rating/modal-branch-rating.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { ModalTenXtenMaintenanceCheckComponent } from '../../../mantenimientos/dialogs/systems/modal-ten-xten-maintenance-check/modal-ten-xten-maintenance-check.component';
import { ModalTenXtenMaintenanceHistoryComponent } from '../../../mantenimientos/dialogs/systems/modal-ten-xten-maintenance-history/modal-ten-xten-maintenance-history.component';
import { CheckMantenimientoSisAvComponent } from '../../../mantenimientos/dialogs/sistemas-av/check-mantenimiento-sis-av-dialog/check-mantenimiento-sis-av-dialog.component';
import { MantenimientoSys } from '../../../mantenimientos/interfaces/mantenimiento-sys.interface';
import { MantenimientoSysAv } from '../../../mantenimientos/interfaces/mantenimiento-sys-av.interface';
import { Maintenance10x10Service } from '../../../mantenimientos/services/maintenance-10x10.service';

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
    ModalBranchRatingComponent,
    FormsModule,
    CheckMantenimientoSisAvComponent
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
  mostrarModal8x8: boolean = false;
  mostrarModalHistorialMantenimientos: boolean = false;
  mostrarModalRating: boolean = false;
  mostrarTPVs: boolean = false;

  sucursal: Sucursal | undefined;
  mantenimientoActivo: MantenimientoSys | null = null;
  mantenimientoAVActivo: MantenimientoSysAv | null = null;
  areas: Area[] = [];
  usuario: Usuario;
  ticket: Ticket | undefined;

  private unsubscribe!: () => void;
  private unsubscribeAV!: () => void;

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

    if (this.unsubscribeAV) {
      this.unsubscribeAV();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['esEspectadorActivo']) {
      const prev = changes['esEspectadorActivo'].previousValue;
      const curr = changes['esEspectadorActivo'].currentValue;

      // Aquí pones la lógica que quieres que se ejecute cuando cambie
      this.onEspectadorActivoChanged(curr);
      this.cdr.detectChanges();
    }
  }

  onEspectadorActivoChanged(nuevoValor: boolean) {

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
        this.mantenimientoActivo = mantenimiento;
        this.cdr.detectChanges();
      }
    );

    this.unsubscribeAV = this.mantenimientoService.getMantenimientoActivoAV(
      this.sucursal?.id,
      (mantenimiento) => {
        this.mantenimientoAVActivo = mantenimiento;
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
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
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

  mostrarAlerta8x8() {
    this.confirmationService.confirm({
      header: 'IMPORTANTE',
      message: `
      TIENES QUE VALIDAR LAS CONDICIONES FINALES EN LAS QUE EL ANALISTA TE ESTÁ ENTREGANDO LA SUCURSAL
      <br><br>
      ES UNA EVALUACIÓN DE MANTENIMIENTO DE SISTEMAS EN 10 PUNTOS
      <br><br>
      CADA UNO DE TUS CHECKS INDICAN QUE SE TE ESTÁ ENTREGANDO EN ÓPTIMAS CONDICIONES LA SUCURSAL, Y NOS DARA PAUTA PARA AGENDAR EL PRÓXIMO MANTENIMIENTO`,
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
        this.mostrarModal8x8 = true;
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
