import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';

import { ModalTicketChatComponent } from '../../dialogs/modal-ticket-chat/modal-ticket-chat.component';
import { DetalleTicketDialogComponent } from '../../dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { EstatusTicket } from '../../interfaces/estatus-ticket.model';
import { TipoSoporte } from '../../interfaces/tipo-soporte.model';
import { PrioridadTicket } from '../../interfaces/prioridad-ticket.model';
import { Categoria } from '../../../categorias/models/categoria.model';
import { Ticket } from '../../interfaces/ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { TicketsService } from '../../services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { AreasService } from '../../../areas/services/areas.service';
import { CategoriesService } from '../../../categorias/services/categories.service';
import { SupportTypesService } from '../../services/support-types.service';
import { TicketsPriorityService } from '../../services/tickets-priority.service';
import { StatusTicketService } from '../../services/status-ticket.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { TicketSlaGaugeComponent } from '../ticket-sla-gauge/ticket-sla-gauge.component';
import { MiniMatrizUrgenciaComponent } from '../../../categorias/components/mini-matriz-urgencia/mini-matriz-urgencia.component';

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

    ModalTicketChatComponent,
    ConfirmDialogModule,
    DetalleTicketDialogComponent,
    TooltipModule,
    CalendarModule,
    DialogModule,
    TicketSlaGaugeComponent,
    MiniMatrizUrgenciaComponent
  ],
  templateUrl: './admin-tickets-list.component.html',
  styleUrl: './admin-tickets-list.component.scss',
})

export class AdminTicketsListComponent {
  @Input() tickets: Ticket[] = [];
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
    public datesHelper: DatesHelperService,
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

  obtenerEstatusInfo(idStatus?: string): any {
    if (!idStatus) return undefined;
    return this.estatusTicket.find(s => String(s.id) === String(idStatus));
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

  obtenerNombreTipoSoporte(idTipoSoporte?: string | null): string {
    if (!idTipoSoporte) return 'NO DEFINIDO';
    let temp = this.tiposSoporte.find((x) => String(x.id) === String(idTipoSoporte));
    return temp ? temp.name : 'NO DEFINIDO';
  }

  obtenerUsuariosHelp() {
    this.usuariosHelp = this.usersService.usuarios;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
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

  abrirModalDetalleTicket(itemticket: Ticket | any) {
    this.mostrarModalTicketDetail = true;
    this.ticket = itemticket;
  }

  onClick() {
    if (this.ticketSeleccionado) {
      this.abrirModalDetalleTicket(this.ticketSeleccionado);
    }
  }

  obtenerSubcategorias = (idCategoria: string) => this.categorias.find(x => x.id == idCategoria)?.subcategorias;

  clasificarPrioridad(score: number): string {
    if (score >= 7) return 'Crítico';
    if (score >= 5) return 'Alto';
    if (score >= 3) return 'Medio';
    return 'Bajo';
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
