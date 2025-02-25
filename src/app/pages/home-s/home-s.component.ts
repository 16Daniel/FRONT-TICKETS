import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sucursal } from '../../models/sucursal.model';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Ticket } from '../../models/ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { ModalGenerateTicketComponent } from '../../modals/tickets/modal-generate-ticket/modal-generate-ticket.component';
import { ModalTicketDetailComponent } from '../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component';
import { ModalFilterTicketsComponent } from '../../modals/tickets/modal-filter-tickets/modal-filter-tickets.component';
import { ModalTicketsHistoryComponent } from '../../modals/tickets/modal-tickets-history/modal-tickets-history.component';
import { ModalTenXtenMaintenanceCheckComponent } from '../../modals/maintenance/modal-ten-xten-maintenance-check/modal-ten-xten-maintenance-check.component';
import { Mantenimiento10x10 } from '../../models/mantenimiento-10x10.model';
import { Maintenance10x10Service } from '../../services/maintenance-10x10.service';
import { ModalTenXtenMaintenanceHistoryComponent } from '../../modals/maintenance/modal-ten-xten-maintenance-history/modal-ten-xten-maintenance-history.component';
import { Usuario } from '../../models/usuario.model';
import { Area } from '../../models/area';
import { ModalTenXtenMaintenanceNewComponent } from '../../modals/maintenance/modal-ten-xten-maintenance-new/modal-ten-xten-maintenance-new.component';
import { PriorityTicketsAccordionSComponent } from '../../components/tickets/priority-tickets-accordion-s/priority-tickets-accordion-s.component';
@Component({
  selector: 'app-home-s',
  standalone: true,
  imports: [
    TableModule,
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
    FormsModule,
    PriorityTicketsAccordionSComponent,
    ModalTenXtenMaintenanceNewComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home-s.component.html',
})
export default class homeSComponent implements OnInit {

  showModalGenerateTicket: boolean = false;
  showModalFilterTickets: boolean = false;
  showModalTicketDetail: boolean = false;
  showModalHistorial: boolean = false;
  showModal10x10: boolean = false;
  ShowModal10x10New:boolean = false; 
  showModalHistorialMantenimientos: boolean = false;
  public itemtk: Ticket | undefined;
  sucursal: Sucursal | undefined;
  tickets: Ticket[] = [];
  todosLosTickets: Ticket[] = [];
  mantenimientoActivo: Mantenimiento10x10 | null = null;
  formdepto: any;
  areas: Area[] = [];
  subscriptiontk: Subscription | undefined;
  usuario: Usuario;
  selectedtk: Ticket | undefined;
  loading: boolean = false;
  arr_ultimosmantenimientos:Mantenimiento10x10[] = []; 
  private unsubscribe!: () => void;
  public ordenarxmantenimiento:boolean = false;  
  constructor(
    public cdr: ChangeDetectorRef,
    private ticketsService: TicketsService,
    private mantenimientoService: Maintenance10x10Service
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.usuario.uid;
    this.getTicketsResponsable(idu);
    this.sucursal = this.usuario.sucursales[0];
    this.formdepto = this.sucursal;
  }

  ngOnInit(): void {
    this.obtnerUltimosMantenimientos(); 
  }

  obtnerUltimosMantenimientos()
  {
    let sucursales:Sucursal[] = this.usuario.sucursales; 
    let array_ids_Sucursales:string[] = [];  

    for(let item of sucursales)
      {
        array_ids_Sucursales.push(item.id); 
      }

      this.loading = true;
    this.subscriptiontk = this.mantenimientoService
      .obtenerUltimosMantenimientos(array_ids_Sucursales)
      .subscribe({
        next: (data) => {
          this.arr_ultimosmantenimientos = data.filter((elemento): elemento is Mantenimiento10x10 => elemento !== null);
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  ngOnDestroy() {
    if (this.subscriptiontk != undefined) {
      this.subscriptiontk.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }


  async getTicketsResponsable(userid: string): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.ticketsService
      .getTicketsResponsable(userid)
      .subscribe({
        next: (data) => {
          this.tickets = data;
          let arr_temp: Ticket[] = [];
          let temp1: Ticket[] = this.tickets.filter(
            (x) => x.prioridadSucursal == 'PÁNICO'
          );
          let temp2: Ticket[] = this.tickets.filter(
            (x) => x.prioridadSucursal == 'ALTA'
          );
          let temp3: Ticket[] = this.tickets.filter(
            (x) => x.prioridadSucursal == 'MEDIA'
          );
          let temp4: Ticket[] = this.tickets.filter(
            (x) => x.prioridadSucursal == 'BAJA'
          );

          temp1 = temp1.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp2 = temp2.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp3 = temp3.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp4 = temp4.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );
          arr_temp = [...temp1, ...temp2, ...temp3, ...temp4];
          this.todosLosTickets = [...arr_temp];
          this.tickets = arr_temp;

          if (this.itemtk != undefined) {
            let temp = this.tickets.filter((x) => x.id == this.itemtk!.id);
            if (temp.length > 0) {
              this.itemtk = temp[0];
            }
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    let str = '';

    if (value == 'ALTA') {
      str = '#ff0000';
    }

    if (value == 'MEDIA') {
      str = '#ffe800';
    }

    if (value == 'BAJA') {
      str = '#61ff00';
    }
    return str;
  }


  obtenerNombreProveedor(idp: string): string {
    let nombre = '';
    let proveedor = this.areas.filter((x) => x.id == idp);
    if (proveedor.length > 0) {
      nombre = proveedor[0].nombre;
    }
    return nombre;
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



  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.itemtk = ticket;
    this.showModalTicketDetail = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show'); // Cierra todas las secciones del accordion
      });
    }, 50);
  }

  nuevoMantenimiento()
  {
      this.ShowModal10x10New = true; 
  }

 
}
