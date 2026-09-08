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

import { DialogModule } from 'primeng/dialog';
import { SelectorArbolCategoriaComponent } from '../selector-arbol-categoria/selector-arbol-categoria.component';
import { SeleccionArbolCategoria } from '../../interfaces/seleccion-arbol-categoria.interface';
import { TicketSlaGaugeComponent } from '../ticket-sla-gauge/ticket-sla-gauge.component';

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
    CalendarModule,
    DialogModule,
    SelectorArbolCategoriaComponent,
    TicketSlaGaugeComponent
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
  mostrarModalCambiarCategoria: boolean = false;
  ticketEnCambioCategoria: Ticket | null = null;
  nuevaSeleccionCategoria: SeleccionArbolCategoria | null = null;
  private rutaCache = new WeakMap<Ticket, { key: string; info: { ruta: string; categoriaRaiz: string; rutaPadres: string; hoja: string } }>();

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

    let nombreSubcategoria = ticket.nombreSubcategoria || '';
    if (cat?.subcategorias && ticket.idSubcategoria) {
      const sub = this.buscarSubcategoriaRecursiva(cat.subcategorias, String(ticket.idSubcategoria));
      if (sub?.nombre) {
        nombreSubcategoria = sub.nombre;
      }
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

  obtenerSubcategorias = (idCategoria: string) => this.categorias.find(x => x.id == idCategoria)?.subcategorias;

  readonly celdasMatriz = [
    { impacto: 3, urgencia: 3 }, { impacto: 3, urgencia: 2 }, { impacto: 3, urgencia: 1 },
    { impacto: 2, urgencia: 3 }, { impacto: 2, urgencia: 2 }, { impacto: 2, urgencia: 1 },
    { impacto: 1, urgencia: 3 }, { impacto: 1, urgencia: 2 }, { impacto: 1, urgencia: 1 }
  ];

  readonly celdasMatrizAtencion = [
    { impacto: 3, urgencia: 3 }, { impacto: 3, urgencia: 2 }, { impacto: 3, urgencia: 1 },
    { impacto: 2, urgencia: 3 }, { impacto: 2, urgencia: 2 }, { impacto: 2, urgencia: 1 },
    { impacto: 1, urgencia: 3 }, { impacto: 1, urgencia: 2 }, { impacto: 1, urgencia: 1 }
  ];

  obtenerCoordenadasTicket(tk: Ticket): { impacto: number; urgencia: number; score: number; prioridad: string } {
    const critRaw = tk.criticidadUrgencia ?? (tk as any).criticidad;
    const urgRaw = tk.urgenciaUrgencia ?? (tk as any).urgencia;
    const scoreRaw = tk.scoreUrgencia ?? (tk as any).score;

    // 1. Si el ticket tiene criticidad y urgencia guardados directamente
    if (critRaw && urgRaw) {
      const urgencia = Math.min(3, Math.max(1, urgRaw));
      let score = scoreRaw || (critRaw * urgencia);
      if (score > 9) score = 9;

      // Normalizar impacto si criticidad vino con el score (ej. 9 o 6)
      let impacto = critRaw;
      if (impacto > 3) {
        impacto = Math.round(score / urgencia);
      }
      impacto = Math.min(3, Math.max(1, impacto || 2));
      const prioridad = tk.prioridadUrgencia || this.clasificarPrioridad(score);
      return { impacto, urgencia, score, prioridad };
    }

    // 2. Si tiene score pero no criticidad
    if (scoreRaw) {
      const score = Math.min(9, Math.max(1, scoreRaw));
      const urgencia = Math.min(3, Math.max(1, urgRaw || 2));
      const impacto = Math.min(3, Math.max(1, Math.round(score / urgencia)));
      const prioridad = tk.prioridadUrgencia || this.clasificarPrioridad(score);
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
          const sub = this.buscarSubcategoriaRecursiva(cat.subcategorias, String(tk.idSubcategoria));
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
    const scoreGlobal = tk.scoreGlobal ? ` · Score Global: ${tk.scoreGlobal}` : '';
    return `Urgencia (Inicio): Criticidad ${coord.impacto} × Urgencia ${coord.urgencia} (Score: ${coord.score}) — Prioridad: ${coord.prioridad}${scoreGlobal}`;
  }

  obtenerPrioridadAtencionTicket(tk: Ticket): 'Crítico' | 'Alto' | 'Medio' | 'Bajo' {
    if (tk.prioridadAtencion) {
      return tk.prioridadAtencion;
    }
    if (tk.idCategoria) {
      const cat = this.categorias.find((c) => String(c.id) === String(tk.idCategoria));
      if (cat) {
        if (tk.idSubcategoria && cat.subcategorias) {
          const sub = this.buscarSubcategoriaRecursiva(cat.subcategorias, String(tk.idSubcategoria));
          if (sub && sub.prioridadAtencion) {
            return sub.prioridadAtencion;
          }
        }
        if (cat.prioridadAtencion) {
          return cat.prioridadAtencion;
        }
      }
    }
    const coord = this.obtenerCoordenadasTicket(tk);
    return (coord.prioridad as any) || 'Medio';
  }

  obtenerCoordenadasAtencionTicket(tk: Ticket): { impacto: number; urgencia: number; score: number; prioridad: string } {
    if (tk.criticidadAtencion && tk.urgenciaAtencion) {
      const urgencia = Math.min(3, Math.max(1, tk.urgenciaAtencion));
      let impacto = Math.min(3, Math.max(1, tk.criticidadAtencion));
      let score = tk.scoreAtencion || (impacto * urgencia);
      const prioridad = tk.prioridadAtencion || this.clasificarPrioridad(score);
      return { impacto, urgencia, score, prioridad };
    }

    // Fallback si solo tiene prioridadAtencion o categoría
    const prioridad = this.obtenerPrioridadAtencionTicket(tk);
    switch (prioridad) {
      case 'Crítico':
        return { impacto: 3, urgencia: 3, score: 9, prioridad: 'Crítico' };
      case 'Alto':
        return { impacto: 2, urgencia: 3, score: 6, prioridad: 'Alto' };
      case 'Bajo':
        return { impacto: 1, urgencia: 1, score: 1, prioridad: 'Bajo' };
      case 'Medio':
      default:
        return { impacto: 2, urgencia: 2, score: 4, prioridad: 'Medio' };
    }
  }

  esCeldaAtencionActiva(tk: Ticket, impacto: number, urgencia: number): boolean {
    const coord = this.obtenerCoordenadasAtencionTicket(tk);
    return coord.impacto === impacto && coord.urgencia === urgencia;
  }

  obtenerColorMatrizAtencion(tk: Ticket): string {
    const coord = this.obtenerCoordenadasAtencionTicket(tk);
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

  obtenerTooltipMatrizAtencion(tk: Ticket): string {
    const coord = this.obtenerCoordenadasAtencionTicket(tk);
    const scoreGlobal = tk.scoreGlobal ? ` · Score Global: ${tk.scoreGlobal}` : '';
    return `Atención (Resolución): Criticidad ${coord.impacto} × Urgencia ${coord.urgencia} (Score: ${coord.score}) — Prioridad: ${coord.prioridad}${scoreGlobal}`;
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
          ticket.criticidadUrgencia = 3;
          ticket.urgenciaUrgencia = 3;
          ticket.scoreUrgencia = 9;
          ticket.prioridadUrgencia = 'Crítico';

          ticket.criticidadAtencion = 3;
          ticket.urgenciaAtencion = 3;
          ticket.scoreAtencion = 9;
          ticket.prioridadAtencion = 'Crítico';

          ticket.scoreGlobal = 18;

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

  buscarSubcategoriaRecursiva(subcategorias: any[], idBuscado: string): any | null {
    if (!subcategorias || !subcategorias.length) return null;
    for (const sub of subcategorias) {
      if (String(sub.id) === idBuscado) return sub;
      if (sub.subcategorias && sub.subcategorias.length > 0) {
        const found = this.buscarSubcategoriaRecursiva(sub.subcategorias, idBuscado);
        if (found) return found;
      }
    }
    return null;
  }

  abrirModalCambiarCategoria(tk: Ticket) {
    this.ticketEnCambioCategoria = tk;
    this.nuevaSeleccionCategoria = null;
    this.mostrarModalCambiarCategoria = true;
  }

  cerrarModalCambiarCategoria() {
    this.mostrarModalCambiarCategoria = false;
    this.ticketEnCambioCategoria = null;
    this.nuevaSeleccionCategoria = null;
  }

  onSeleccionarEnModal(seleccion: SeleccionArbolCategoria) {
    this.nuevaSeleccionCategoria = seleccion;
  }

  guardarNuevaCategoria() {
    if (!this.ticketEnCambioCategoria || !this.nuevaSeleccionCategoria) return;

    const tk = this.ticketEnCambioCategoria;
    const sel = this.nuevaSeleccionCategoria;

    tk.idCategoria = sel.idCategoria;
    tk.idSubcategoria = sel.idSubcategoria ?? null;
    tk.nombreCategoria = sel.nombreCategoria;
    tk.nombreSubcategoria = sel.nombreSubcategoria ?? '';

    // Urgencia (3×3)
    const critUrg = sel.criticidadUrgencia || sel.subcategoria?.criticidadUrgencia || sel.categoria?.criticidadUrgencia || sel.criticidad || 2;
    const urgUrg = sel.urgenciaUrgencia || sel.subcategoria?.urgenciaUrgencia || sel.categoria?.urgenciaUrgencia || sel.urgencia || 2;
    const scoreUrg = sel.scoreUrgencia || sel.score || (critUrg * urgUrg);
    const prioUrg = sel.prioridadUrgencia || sel.prioridad || 'Medio';

    tk.criticidadUrgencia = Math.min(3, Math.max(1, critUrg));
    tk.urgenciaUrgencia = Math.min(3, Math.max(1, urgUrg));
    tk.scoreUrgencia = scoreUrg;
    tk.prioridadUrgencia = prioUrg as any;

    // Atención (3×3)
    const critAten = sel.criticidadAtencion || sel.subcategoria?.criticidadAtencion || sel.categoria?.criticidadAtencion || tk.criticidadUrgencia;
    const urgAten = sel.urgenciaAtencion || sel.subcategoria?.urgenciaAtencion || sel.categoria?.urgenciaAtencion || tk.urgenciaUrgencia;
    const scoreAten = sel.scoreAtencion || (critAten * urgAten);
    const prioAten = sel.prioridadAtencion || sel.subcategoria?.prioridadAtencion || sel.categoria?.prioridadAtencion || 'Medio';

    tk.criticidadAtencion = Math.min(3, Math.max(1, critAten));
    tk.urgenciaAtencion = Math.min(3, Math.max(1, urgAten));
    tk.scoreAtencion = scoreAten;
    tk.prioridadAtencion = prioAten as any;

    // Global
    tk.scoreGlobal = sel.scoreGlobal || (scoreUrg + scoreAten);

    (tk as any).prioridad = prioUrg;

    this.rutaCache.delete(tk);

    this.ticketsService
      .update({ ...tk })
      .then(() => {
        this.showMessage('success', 'Categoría actualizada', `Se asignó: ${sel.rutaCompleta}`);
        this.cdr.detectChanges();
        this.cerrarModalCambiarCategoria();
      })
      .catch((error) => {
        console.error('Error al actualizar categoría:', error);
        this.showMessage('error', 'Error', 'Error al guardar la categoría');
      });
  }

  obtenerInfoRutaTicket(tk: Ticket): { ruta: string; categoriaRaiz: string; rutaPadres: string; hoja: string } {
    if (!tk) {
      return { ruta: 'Sin Categoría', categoriaRaiz: '', rutaPadres: '', hoja: 'Sin Categoría' };
    }

    const cacheKey = `${tk.idCategoria}_${tk.idSubcategoria}_${tk.nombreCategoria}_${tk.nombreSubcategoria}_${this.categorias.length}`;
    const cached = this.rutaCache.get(tk);
    if (cached && cached.key === cacheKey) {
      return cached.info;
    }

    let resultado = { ruta: 'Sin Categoría', categoriaRaiz: '', rutaPadres: '', hoja: 'Sin Categoría' };

    if (this.categorias && this.categorias.length > 0) {
      const idSubBuscado = tk.idSubcategoria ? String(tk.idSubcategoria) : null;
      const idCatBuscado = tk.idCategoria ? String(tk.idCategoria) : null;

      if (idSubBuscado) {
        for (const cat of this.categorias) {
          const buscarTrail = (lista: any[], trail: string[]): string[] | null => {
            for (const sub of lista) {
              if (sub.eliminado) continue;
              const nuevoTrail = [...trail, sub.nombre];
              if (String(sub.id) === idSubBuscado) {
                return nuevoTrail;
              }
              if (sub.subcategorias && sub.subcategorias.length > 0) {
                const res = buscarTrail(sub.subcategorias, nuevoTrail);
                if (res) return res;
              }
            }
            return null;
          };

          if (cat.subcategorias && cat.subcategorias.length > 0) {
            const trail = buscarTrail(cat.subcategorias, [cat.nombre]);
            if (trail) {
              const ruta = trail.join(' › ');
              const categoriaRaiz = cat.nombre;
              const hoja = trail[trail.length - 1];
              const rutaPadres = trail.length > 1 ? trail.slice(0, -1).join(' › ') : '';
              resultado = { ruta, categoriaRaiz, rutaPadres, hoja };
              this.rutaCache.set(tk, { key: cacheKey, info: resultado });
              return resultado;
            }
          }
        }
      }

      if (idCatBuscado) {
        const cat = this.categorias.find(c => String(c.id) === idCatBuscado);
        if (cat) {
          if (tk.nombreSubcategoria) {
            resultado = {
              ruta: `${cat.nombre} › ${tk.nombreSubcategoria}`,
              categoriaRaiz: cat.nombre,
              rutaPadres: cat.nombre,
              hoja: tk.nombreSubcategoria
            };
          } else {
            resultado = {
              ruta: cat.nombre,
              categoriaRaiz: cat.nombre,
              rutaPadres: '',
              hoja: cat.nombre
            };
          }
          this.rutaCache.set(tk, { key: cacheKey, info: resultado });
          return resultado;
        }
      }
    }

    if (tk.nombreCategoria && tk.nombreSubcategoria) {
      resultado = {
        ruta: `${tk.nombreCategoria} › ${tk.nombreSubcategoria}`,
        categoriaRaiz: tk.nombreCategoria,
        rutaPadres: tk.nombreCategoria,
        hoja: tk.nombreSubcategoria
      };
    } else if (tk.nombreCategoria) {
      resultado = {
        ruta: tk.nombreCategoria,
        categoriaRaiz: tk.nombreCategoria,
        rutaPadres: '',
        hoja: tk.nombreCategoria
      };
    }

    this.rutaCache.set(tk, { key: cacheKey, info: resultado });
    return resultado;
  }
}
