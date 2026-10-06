import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import Swal from 'sweetalert2';

import { DetalleTicketDialogComponent } from '../../dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { EstatusTicket } from '../../../tickets/interfaces/estatus-ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { StatusTicketService } from '../../../tickets/services/status-ticket.service';
import { AreasService } from '../../../areas/services/areas.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Comentario } from '../../../shared/interfaces/comentario-chat.model';

@Component({
  selector: 'app-specialist-home-page',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TooltipModule,
    DetalleTicketDialogComponent,
    ConfirmDialogModule,  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './specialist-home-page.html',
  styleUrl: './specialist-home-page.scss'
})

export default class SpecialistHomePageComponent implements OnInit, OnChanges {
  usuario: Usuario;
  tickets: Ticket[] = [];
  ticketSeleccionado: Ticket = new Ticket;
  estatusTickets: EstatusTicket[] = [];
  areas: Area[] = [];
  sucursales: Sucursal[] = [];
  usuariosHelp: Usuario[] = [];
  ticket: Ticket | undefined;
  mostrarModalTicketDetail: boolean = false;

  mostrarModalChatTicket: boolean = false;

  constructor(
    private ticketsService: TicketsService,
    private statusTicketsService: StatusTicketService,
    private areasService: AreasService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private branchesService: BranchesService,
    private usersService: UsersService,
    private confirmationService: ConfirmationService,
    public datesHelper: DatesHelperService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);

    this.areasService.areas$.subscribe(areas => this.areas = areas);
  }

  ngOnInit(): void {
    this.getTicketsPorEspecialista();
    this.obtenerCatalogoEstatusTickets();
    this.obtenerSucursales();
    this.obtenerUsuariosHelp();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.observaActualizacionesChatTicket(changes);
  }

  getTicketsPorEspecialista() {
    this.ticketsService.getTicketsPorEspecialista(this.usuario.id)
      .subscribe(result => {
        this.tickets = result;
        this.cdr.detectChanges()
      });
  }

  obtenerNombreEstatusTicket(idEstatusTicket: string) {
    if (this.estatusTickets.length == 0) return;
    let nombre: string = this.estatusTickets.filter(
      (x) => x.id == idEstatusTicket
    )[0].nombre;

    return nombre;
  }

  obtenerCatalogoEstatusTickets() {
    this.statusTicketsService
      .get()
      .subscribe((result) => (this.estatusTickets = result));
  }

  obtenerNombreArea(idArea: string): string {
    let nombre = '';
    let area = this.areas.filter((x) => x.id == idArea);
    if (area.length > 0) {
      nombre = area[0].nombre;
    }
    return nombre;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.id == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    let str = '';

    if (value == '2') {
      str = '#ff0000';
    }

    if (value == '3') {
      str = '#ffe800';
    }

    if (value == '4') {
      str = '#61ff00';
    }

    if (value == '1') {
      str = 'black';
    }
    return str;
  }

  obtenerNombreResponsable(id: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == id);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerUsuariosHelp() {
    this.usersService.usuarios$.subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  onClickRechazar(ticket: Ticket) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        'Deseas regresar este ticket?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        ticket.idUsuarioEspecialista = '';
        ticket.esAsignadoEspecialista = false;


        this.ticketsService
          .update(ticket)
          .then(() => {
            this.showMessage('success', 'Success', 'Enviado correctamente');
          })
          .catch((error) => console.error(error));
      },
      reject: () => { },
    });
  }

  onClickChat(ticket: Ticket) {
    this.ticketSeleccionado = ticket;
    this.mostrarModalChatTicket = true;
  }

  observaActualizacionesChatTicket(changes: SimpleChanges) {
    if (changes['tickets'] && changes['tickets'].currentValue) {
      if (this.ticketSeleccionado)
        this.ticketSeleccionado = this.tickets.filter(
          (x) => x.id == this.ticketSeleccionado.id
        )[0];
    }
  }

  onClickValidar(ticket: Ticket | any) {
    Swal.fire({
      title: 'Validar Ticket',
      html: `
        <style>
          .rating-container { display: flex; justify-content: center; gap: 8px; margin-top: 20px; flex-wrap: wrap; }
          .rating-option { 
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            cursor: pointer; padding: 12px 8px; border: 2px solid #e2e8f0; border-radius: 12px; 
            transition: all 0.2s ease; flex: 1; min-width: 70px; background: #ffffff;
          }
          .rating-option:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-2px); }
          .rating-option.selected { border-color: #F59E0B; background: #FFFBEB; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.1); }
          .rating-stars { font-size: 1.2rem; line-height: 1; margin-bottom: 8px; color: #cbd5e1; letter-spacing: 1px; display: flex; }
          .rating-option:hover .rating-stars { color: #fbbf24; }
          .rating-option.selected .rating-stars { color: #F59E0B; }
          .rating-text { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; text-align: center; }
          .rating-option.selected .rating-text { color: #d97706; font-weight: 800; }
        </style>
        <p class="text-muted" style="font-size: 0.95rem; margin-bottom: 5px;">El estado del ticket se cambiará a <b>POR VALIDAR</b>.</p>
        <p class="text-dark fw-bold m-0" style="font-size: 1.05rem;">Por favor, califica la atención del analista:</p>
        <div class="rating-container" id="custom-rating">
          <div class="rating-option" data-value="1">
            <div class="rating-stars">★</div>
            <div class="rating-text">Malo</div>
          </div>
          <div class="rating-option" data-value="2">
            <div class="rating-stars">★★</div>
            <div class="rating-text">Regular</div>
          </div>
          <div class="rating-option" data-value="3">
            <div class="rating-stars">★★★</div>
            <div class="rating-text">Bueno</div>
          </div>
          <div class="rating-option" data-value="4">
            <div class="rating-stars">★★★★</div>
            <div class="rating-text">Muy<br>Bueno</div>
          </div>
          <div class="rating-option" data-value="5">
            <div class="rating-stars">★★★★★</div>
            <div class="rating-text">Excelente</div>
          </div>
        </div>
        <input type="hidden" id="rating-value" value="">
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText: 'Sí, enviar a validar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost'
      },
      didOpen: () => {
        const options = document.querySelectorAll('.rating-option');
        const input = document.getElementById('rating-value') as HTMLInputElement;
        options.forEach(opt => {
          opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            input.value = opt.getAttribute('data-value') || '';
            Swal.resetValidationMessage();
          });
        });
      },
      preConfirm: () => {
        const val = (document.getElementById('rating-value') as HTMLInputElement).value;
        if (!val) {
          Swal.showValidationMessage('Debes seleccionar una calificación para continuar');
          return false;
        }
        return val;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        ticket.idEstatusTicket = '7';
        ticket.idResponsableFinaliza = this.usuario.id;
        ticket.calificacionAnalista = Number(result.value);

        this.ticketsService
          .update(ticket)
          .then(() => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket enviado a validación correctamente' });
          })
          .catch((error) => console.error(error));
      }
    });
  }

  getUsuarioResponsable(idResponsable: string) {
    return this.usuariosHelp.find(x => x.id == idResponsable)
  }

}
