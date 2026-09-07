import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Timestamp } from '@firebase/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';

import { ModalValidateTicketComponent } from '../../dialogs/modal-validate-ticket/modal-validate-ticket.component';
import { ModalTicketChatComponent } from '../../dialogs/modal-ticket-chat/modal-ticket-chat.component';
import { ModalTicketDetailComponent } from '../../dialogs/modal-ticket-detail/modal-ticket-detail.component';
import { EstatusTicket } from '../../interfaces/estatus-ticket.model';
import { TipoSoporte } from '../../interfaces/tipo-soporte.model';
import { PrioridadTicket } from '../../interfaces/prioridad-ticket.model';
import { Categoria } from '../../interfaces/categoria.mdoel';
import { Ticket } from '../../interfaces/ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { TicketsService } from '../../services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { AreasService } from '../../../areas/services/areas.service';
import { CategoriesService } from '../../services/categories.service';
import { SupportTypesService } from '../../services/support-types.service';
import { TicketsPriorityService } from '../../services/tickets-priority.service';
import { StatusTicketService } from '../../services/status-ticket.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { MensajesPendientesService } from '../../../shared/services/mensajes-pendientes.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';

@Component({
  selector: 'app-admin-tickets-list',
  standalone: true,
  imports: [
    DropdownModule,
    CommonModule,
    FormsModule,
    TableModule,
    BadgeModule,
    AccordionModule,
    ModalValidateTicketComponent,
    ModalTicketChatComponent,
    ConfirmDialogModule,
    ModalTicketDetailComponent,
    TooltipModule,
    CalendarModule
  ],
  templateUrl: './admin-tickets-list.component.html',
  styleUrl: './admin-tickets-list.component.scss',
})

export class AdminTicketsListComponent {
  @Input() tickets: Ticket[] = [];
  @Input() mostrarAcciones: boolean = true;
  @Input() mostrarAccionChat: boolean = true;
  @Input() mostrarAccionFinalizar: boolean = true;
  @Input() mostrarEstrellas: boolean = true;
  @Input() mostrarFedchaEstimacion: boolean = true;
  @Input() mostrarAccionValidar: boolean = true;
  sucursales: Sucursal[] = [];
  tiposSoporte: TipoSoporte[] = [];
  estatusTicket: EstatusTicket[] = [];
  prioridadesTicket: PrioridadTicket[] = [];
  categorias: Categoria[] = [];

  mostrarModalTicketDetail: boolean = false;
  mostrarModalValidarTicket: boolean = false;
  showModalChatTicket: boolean = false;
  areas: Area[] = [];
  ticket: Ticket | undefined;
  ticketAccion: Ticket | any;
  usuariosHelp: Usuario[] = [];
  usuario: any;
  ticketSeleccionado: Ticket | undefined;

  @Input() idArea: string = '';

  constructor(
    private ticketsService: TicketsService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    public areasService: AreasService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private categoriesService: CategoriesService,
    private supportTypesService: SupportTypesService,
    private ticketsPriorityService: TicketsPriorityService,
    private statusTicketService: StatusTicketService,
    private confirmationService: ConfirmationService,
    public datesHelper: DatesHelperService,
    private mensajesPendientesService: MensajesPendientesService
  ) {
    this.areas = this.areasService.areas;
    this.obtenerUsuariosHelp();
    this.obtenerSucursales();
    this.obtenerPrioridadesTicket();
    this.obtenerTiposSoporte();
    this.obtenerEstatusTicket();
    this.obtenerCategorias();
  }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
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

  obtenerTiposSoporte() {
    this.supportTypesService.get().subscribe({
      next: (data) => {
        this.tiposSoporte = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerEstatusTicket() {
    this.statusTicketService.get().subscribe({
      next: (data) => {
        this.estatusTicket = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerPrioridadesTicket() {
    this.ticketsPriorityService.get().subscribe({
      next: (data) => {
        this.prioridadesTicket = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerCategorias() {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));
        this.categorias = this.categorias.filter(x => x.idArea == this.idArea);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerNombreResponsable(id: string): string {
    let name = '';
    let temp = this.usuariosHelp.filter((x) => x.id == id);
    if (temp.length > 0) {
      name = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return name;
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.id == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  obtenerUsuariosHelp() {
    this.usuariosHelp = this.usersService.usuarios;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  actualizarEstatus(ticket: Ticket | any, idEstatusTicket: string) {
    if (idEstatusTicket == '3') ticket.fechaFin = new Date();

    this.actualizaTicket(ticket);
  }

  actualizaTicket(ticket: Ticket) {
    const cat = this.categorias.find(x => String(x.id) === String(ticket.idCategoria));
    const nombreCategoria = cat?.nombre || ticket.nombreCategoria || '';

    let nombreSubcategoria = '';
    if (cat?.subcategorias && ticket.idSubcategoria) {
      const sub = cat.subcategorias.find(x => String(x.id) === String(ticket.idSubcategoria));
      nombreSubcategoria = sub?.nombre || ticket.nombreSubcategoria || '';
    } else {
      nombreSubcategoria = ticket.nombreSubcategoria || '';
    }

    ticket = {
      ...ticket,
      nombreCategoria: nombreCategoria || '',
      nombreSubcategoria: nombreSubcategoria || '',
      idSubcategoria: ticket.idSubcategoria ?? null
    };

    this.ticketsService
      .update({ ...ticket })
      .then(() => { })
      .catch((error) => console.error(error));
  }

  onClickChat(ticket: Ticket) {
    this.ticketAccion = ticket;
    this.showModalChatTicket = true;
  }

  verificarChatNoLeido(ticket: Ticket) {
    const participantes = ticket.participantesChat.sort(
      (a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido
    );
    const participante = participantes.find(
      (p) => p.idUsuario === this.usuario.id
    );

    if (participante) {
      const ultimoComentarioLeido = this.showModalChatTicket
        ? ticket.comentarios.length
        : participante.ultimoComentarioLeido;
      const comentarios = ticket.comentarios;

      // Si el último comentario leído es menor que la longitud actual de los comentarios
      return comentarios.length > ultimoComentarioLeido;
    }

    return false;
  }

  onClickRechazar(ticket: Ticket) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        'El estado del ticket se cambiará a "POR RESOLVER" ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        ticket.idEstatusTicket = '1';
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

  onClickValidar(ticket: Ticket) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        'El estado del ticket se cambiará a "POR VALIDAR" ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.ticketAccion = ticket;
        this.mostrarModalValidarTicket = true;
      },
      reject: () => { },
    });
  }

  onClickValidacionAdmin(ticket: Ticket) {

    const usuariosUnicosMap = new Map<string, { idUsuario: string }>();
    ticket.participantesChat.forEach(p => {
      usuariosUnicosMap.set(p.idUsuario, p);
    });
    const usuariosUnicos = Array.from(usuariosUnicosMap.values());

    usuariosUnicos.forEach(async participante => {
      await this.mensajesPendientesService.marcarComoLeidos(
        ticket.id,
        'Tickets',
        participante.idUsuario
      );
    });

    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        'Validar ticket cerrado ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        ticket.validacionAdmin = true;
        this.actualizaTicket(ticket);
      },
      reject: () => { },
    });
  }

  abrirModalDetalleTicket(itemticket: Ticket | any) {
    this.mostrarModalTicketDetail = true;
    this.ticket = itemticket;
  }

  ManejadorDeFecha(date: Date, tk: Ticket) {
    tk!.fechaEstimacion = Timestamp.fromDate(date);
    this.actualizaTicket(tk);
  }

  obtenerSubcategorias = (idCategoria: string) => this.categorias.find(x => x.id == idCategoria)?.subcategorias;

  readonly celdasMatriz = [
    { impacto: 3, urgencia: 3 }, { impacto: 3, urgencia: 2 }, { impacto: 3, urgencia: 1 },
    { impacto: 2, urgencia: 3 }, { impacto: 2, urgencia: 2 }, { impacto: 2, urgencia: 1 },
    { impacto: 1, urgencia: 3 }, { impacto: 1, urgencia: 2 }, { impacto: 1, urgencia: 1 }
  ];

  obtenerCoordenadasTicket(tk: Ticket): { impacto: number; urgencia: number; score: number; prioridad: string } {
    // 1. Si el ticket tiene criticidad y urgencia guardados directamente
    if (tk.criticidad && tk.urgencia) {
      const urgencia = Math.min(3, Math.max(1, tk.urgencia));
      let score = tk.score || (tk.criticidad * urgencia);
      if (score > 9) score = 9;

      // Normalizar impacto si criticidad vino con el score (ej. 9 o 6)
      let impacto = tk.criticidad;
      if (impacto > 3) {
        impacto = Math.round(score / urgencia);
      }
      impacto = Math.min(3, Math.max(1, impacto || 2));
      const prioridad = this.clasificarPrioridad(score);
      return { impacto, urgencia, score, prioridad };
    }

    // 2. Si tiene score pero no criticidad
    if (tk.score) {
      const score = Math.min(9, Math.max(1, tk.score));
      const urgencia = Math.min(3, Math.max(1, tk.urgencia || 2));
      const impacto = Math.min(3, Math.max(1, Math.round(score / urgencia)));
      const prioridad = this.clasificarPrioridad(score);
      return { impacto, urgencia, score, prioridad };
    }

    const legacyPrioridad = (tk as any).prioridad;
    if (legacyPrioridad) {
      const p = String(legacyPrioridad).toUpperCase();
      if (p.includes('CRÍT') || p.includes('CRIT') || p.includes('PÁN') || p.includes('PAN')) {
        return { impacto: 3, urgencia: 3, score: 9, prioridad: 'Crítico' };
      }
      if (p.includes('ALT')) {
        return { impacto: 3, urgencia: 2, score: 6, prioridad: 'Alto' };
      }
      if (p.includes('MED')) {
        return { impacto: 2, urgencia: 2, score: 4, prioridad: 'Medio' };
      }
      if (p.includes('BAJ')) {
        return { impacto: 1, urgencia: 2, score: 2, prioridad: 'Bajo' };
      }
    }

    if (tk.idCategoria) {
      const cat = this.categorias.find(c => String(c.id) === String(tk.idCategoria));
      if (cat) {
        if (tk.idSubcategoria && cat.subcategorias) {
          const sub = cat.subcategorias.find(s => String(s.id) === String(tk.idSubcategoria));
          if (sub && (sub.criticidad || sub.score)) {
            const urg = Math.min(3, Math.max(1, sub.urgencia || 2));
            const sc = sub.score || ((sub.criticidad || 2) * urg);
            let imp = sub.criticidad && sub.criticidad <= 3 ? sub.criticidad : Math.round(sc / urg);
            imp = Math.min(3, Math.max(1, imp));
            return {
              impacto: imp,
              urgencia: urg,
              score: sc,
              prioridad: sub.prioridadUrgencia || (sub as any).prioridad || this.clasificarPrioridad(sc)
            };
          }
        }
        if (cat.criticidad || cat.score) {
          const urg = Math.min(3, Math.max(1, cat.urgencia || 2));
          const sc = cat.score || ((cat.criticidad || 2) * urg);
          let imp = cat.criticidad && cat.criticidad <= 3 ? cat.criticidad : Math.round(sc / urg);
          imp = Math.min(3, Math.max(1, imp));
          return {
            impacto: imp,
            urgencia: urg,
            score: sc,
            prioridad: cat.prioridadUrgencia || (cat as any).prioridad || this.clasificarPrioridad(sc)
          };
        }
      }
    }

    const fallback = (tk as any).idPrioridadTicket;
    if (fallback === '1') return { impacto: 3, urgencia: 3, score: 9, prioridad: 'Crítico' };
    if (fallback === '2') return { impacto: 3, urgencia: 2, score: 6, prioridad: 'Alto' };
    if (fallback === '3') return { impacto: 2, urgencia: 2, score: 4, prioridad: 'Medio' };
    if (fallback === '4') return { impacto: 1, urgencia: 2, score: 2, prioridad: 'Bajo' };

    return { impacto: 2, urgencia: 2, score: 4, prioridad: 'Medio' };
  }

  clasificarPrioridad(score: number): string {
    if (score >= 7) return 'Crítico';
    if (score >= 5) return 'Alto';
    if (score >= 3) return 'Medio';
    return 'Bajo';
  }

  esCeldaActiva(tk: Ticket, imp: number, urg: number): boolean {
    const coord = this.obtenerCoordenadasTicket(tk);
    return coord.impacto === imp && coord.urgencia === urg;
  }

  obtenerColorMatriz(tk: Ticket): string {
    const coord = this.obtenerCoordenadasTicket(tk);
    switch (coord.prioridad) {
      case 'Crítico':
        return '#EF4444';
      case 'Alto':
        return '#EA580C';
      case 'Medio':
        return '#EAB308';
      case 'Bajo':
        return '#10B981';
      default:
        return '#3B82F6';
    }
  }

  obtenerClaseCuadrante(tk: Ticket): string {
    const coord = this.obtenerCoordenadasTicket(tk);
    switch (coord.prioridad) {
      case 'Crítico':
        return 'cuadrante-critico';
      case 'Alto':
        return 'cuadrante-alto';
      case 'Medio':
        return 'cuadrante-medio';
      case 'Bajo':
        return 'cuadrante-bajo';
      default:
        return 'cuadrante-medio';
    }
  }

  obtenerNombrePrioridad(tk: Ticket): string {
    return this.obtenerCoordenadasTicket(tk).prioridad.toUpperCase();
  }

  obtenerTooltipMatriz(tk: Ticket): string {
    const coord = this.obtenerCoordenadasTicket(tk);
    return `Criticidad: ${coord.impacto} × Urgencia: ${coord.urgencia} (Score: ${coord.score}) — Prioridad: ${coord.prioridad}`;
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    if (value == '2') return '#EF4444';
    if (value == '3') return '#EAB308';
    if (value == '4') return '#10B981';
    if (value == '1') return '#EF4444';
    return '#64748b';
  }

  onPanicoClick(idTicket: string) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: 'El estado del ticket se cambiará a Crítico / Pánico ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        let temp = this.tickets.filter((x) => x.id == idTicket);
        if (temp.length > 0) {
          let ticket = temp[0];
          ticket.criticidad = 3;
          ticket.urgencia = 3;
          ticket.score = 9;

          this.ticketsService
            .update(ticket)
            .then(() => {
              this.showMessage('success', 'Success', 'Enviado correctamente');
            })
            .catch((error) =>
              console.error('Error al actualizar los comentarios:', error)
            );
        }
      },
      reject: () => { },
    });
  }
}
