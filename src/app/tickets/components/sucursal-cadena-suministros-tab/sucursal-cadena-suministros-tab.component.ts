import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { ModalTicketDetailComponent } from '../../../tickets/dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { ModalFilterTicketsComponent } from '../../../tickets/dialogs/modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketsHistoryComponent } from '../../../tickets/dialogs/modal-tickets-history/modal-tickets-history.component';
import { PriorityTicketsAccordionComponent } from '../../../tickets/components/priority-tickets-accordion/priority-tickets-accordion.component';
import { ModalBranchRatingComponent } from '../../../tickets/components/modal-branch-rating/modal-branch-rating.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { MantenimientoSys } from '../../../mantenimientos/interfaces/mantenimiento-sys.interface';
import { MantenimientoAudioVideo } from '../../../mantenimientos/interfaces/mantenimiento-audio-video.interface';
import { MantenimientosSistemasService } from '../../../mantenimientos/services/mantenimientos-sistemas.service';
import { CrearTicketDialogComponent } from '../../dialogs/crear-ticket-dialog/crear-ticket-dialog.component';
import { MaintenanceAvService } from '../../../mantenimientos/services/maintenance-av.service';

@Component({
  selector: 'app-sucursal-cadena-suministros-tab',
  standalone: true,
  imports: [
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    CrearTicketDialogComponent,
    ModalTicketDetailComponent,
    ModalFilterTicketsComponent,
    ModalTicketsHistoryComponent,
    PriorityTicketsAccordionComponent,
    ModalBranchRatingComponent,
    FormsModule,
  ],
  templateUrl: './sucursal-cadena-suministros-tab.component.html',
  styleUrl: './sucursal-cadena-suministros-tab.component.scss'
})
export class SucursalCadenaSuministrosTabComponent {
  @Input() tickets: Ticket[] = [];
  @Input() todosLosTickets: Ticket[] = [];
  @Input() esEspectadorActivo: boolean = false;

  mostrarModalGenerateTicket: boolean = false;
  mostrarModalFilterTickets: boolean = false;
  mostrarModalTicketDetail: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarModalMtooTI: boolean = false;
  mostrarModalAV: boolean = false;
  mostrarModalHistorialMantenimientos: boolean = false;
  mostrarModalHistorialMantenimientosAV: boolean = false;
  mostrarModalRating: boolean = false;
  mostrarTPVs: boolean = false;
  idArea: string = "20";

  sucursal: Sucursal | undefined;
  mantenimientoActivo: MantenimientoSys | null = null;
  mantenimientoAVActivo: MantenimientoAudioVideo | null = null;
  areas: Area[] = [];
  usuario: Usuario;
  ticket: Ticket | undefined;

  private unsubscribe!: () => void;
  private unsubscribeAV!: () => void;

  constructor(
    public cdr: ChangeDetectorRef,
    private mantenimientosAvService: MaintenanceAvService,
    private confirmationService: ConfirmationService,
    private mantenimientosSistemasService: MantenimientosSistemasService
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
    this.unsubscribe = this.mantenimientosSistemasService.getMantenimientoActivo(
      this.sucursal?.id,
      (mantenimiento) => {
        this.mantenimientoActivo = mantenimiento;
        this.cdr.detectChanges();
      }
    );

    this.unsubscribeAV = this.mantenimientosAvService.getMantenimientoActivo(
      this.sucursal?.id,
      (mantenimiento) => {
        this.mantenimientoAVActivo = mantenimiento;
        this.cdr.detectChanges();
        // console.log('Mantenimiento activo:', this.mantenimientoActivo);
      }
    );
  }

  mostrarAlertaIT() {
    this.confirmationService.confirm({
      header: 'IMPORTANTE',
      message: `
      TIENES QUE VALIDAR LAS CONDICIONES FINALES EN LAS QUE EL ANALISTA TE ESTÁ ENTREGANDO LA SUCURSAL
      <br><br>
      ES UNA EVALUACIÓN DE MANTENIMIENTO DE SISTEMAS EN 8 PUNTOS
      <br><br>
      CADA UNO DE TUS CHECKS INDICAN QUE SE TE ESTÁ ENTREGANDO EN ÓPTIMAS CONDICIONES LA SUCURSAL, Y NOS DARA PAUTA PARA AGENDAR EL PRÓXIMO MANTENIMIENTO`,
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
        this.mostrarModalMtooTI = true;
      },
      reject: () => { },
    });
  }

  mostrarAlertaAV() {
    this.confirmationService.confirm({
      header: 'IMPORTANTE',
      message: `
      TIENES QUE VALIDAR LAS CONDICIONES FINALES EN LAS QUE EL ANALISTA TE ESTÁ ENTREGANDO LA SUCURSAL
      <br><br>
      ES UNA EVALUACIÓN DE MANTENIMIENTO DE AUDIO Y VIDEO EN 6 PUNTOS
      <br><br>
      CADA UNO DE TUS CHECKS INDICAN QUE SE TE ESTÁ ENTREGANDO EN ÓPTIMAS CONDICIONES LA SUCURSAL, Y NOS DARA PAUTA PARA AGENDAR EL PRÓXIMO MANTENIMIENTO`,
      acceptLabel: 'Aceptar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
        this.mostrarModalAV = true;
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
