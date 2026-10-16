import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Ticket } from '../../interfaces/ticket.model';
import { MatrizUrgencia } from '../../../categorias/interfaces/matriz-urgencia.interface';
import { TicketSlaGaugeComponent } from '../ticket-sla-gauge/ticket-sla-gauge.component';
import { DetalleTicketDialogComponent } from '../../dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { CategoriesService } from '../../../categorias/services/categories.service';

@Component({
  selector: 'app-lista-tickets-kpis',
  standalone: true,
  imports: [CommonModule, TooltipModule, TicketSlaGaugeComponent, DetalleTicketDialogComponent],
  providers: [MessageService],
  templateUrl: './lista-tickets-kpis.component.html',
  styleUrl: './lista-tickets-kpis.component.scss'
})
export class ListaTicketsKpisComponent implements OnInit, OnDestroy {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: any[] = [];
  @Input() categorias: any[] = [];
  @Input() matrizUrgencia: MatrizUrgencia | undefined;
  @Input() tituloContexto: string = '';
  @Input() tituloSeccion: string = 'Tickets Pendientes';

  showTicketDialog = false;
  selectedTicketForDialog: Ticket | null = null;

  private subs = new Subscription();

  constructor(
    private branchesService: BranchesService,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    if (!this.sucursales || this.sucursales.length === 0) {
      this.subs.add(
        this.branchesService.get().subscribe({
          next: (data) => (this.sucursales = data),
          error: (err) => console.error('Error al cargar sucursales en ListaTicketsKpisComponent:', err)
        })
      );
    }

    if (!this.categorias || this.categorias.length === 0) {
      this.subs.add(
        this.categoriesService.get().subscribe({
          next: (data) => (this.categorias = data),
          error: (err) => console.error('Error al cargar categorías en ListaTicketsKpisComponent:', err)
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  abrirDetalleTicket(ticket: Ticket): void {
    this.selectedTicketForDialog = ticket;
    this.showTicketDialog = true;
  }

  cerrarDetalleTicket(): void {
    this.showTicketDialog = false;
    this.selectedTicketForDialog = null;
  }

  obtenerNombreSucursal(idSucursal?: any): string {
    if (!idSucursal) return 'Sin Sucursal';
    if (typeof idSucursal === 'object' && idSucursal?.nombre) {
      return idSucursal.nombre;
    }
    const found = this.sucursales?.find(s => String(s.id) === String(idSucursal));
    return found?.nombre || `Sucursal ${idSucursal}`;
  }

  obtenerCategoriaFinal(ticket: Ticket): string {
    if (ticket.nombreSubcategoria && ticket.nombreSubcategoria.trim()) {
      return ticket.nombreSubcategoria.trim();
    }
    if (this.categorias && this.categorias.length > 0 && ticket.idSubcategoria) {
      const sub = this.buscarSubcategoriaPorId(this.categorias, String(ticket.idSubcategoria));
      if (sub && sub.nombre) {
        return sub.nombre;
      }
    }
    if (ticket.nombreCategoria && ticket.nombreCategoria.trim()) {
      return ticket.nombreCategoria.trim();
    }
    if (this.categorias && this.categorias.length > 0 && ticket.idCategoria) {
      const cat = this.categorias.find(c => String(c.id) === String(ticket.idCategoria));
      if (cat && cat.nombre) {
        return cat.nombre;
      }
    }
    return 'Sin Categoría';
  }

  obtenerCategoriaTooltip(ticket: Ticket): string {
    if (ticket.nombreCategoria && ticket.nombreSubcategoria) {
      return `${ticket.nombreCategoria} › ${ticket.nombreSubcategoria}`;
    }
    return this.obtenerCategoriaFinal(ticket);
  }

  private buscarSubcategoriaPorId(lista: any[], idSub: string): any | null {
    for (const item of lista) {
      if (String(item.id) === idSub) {
        return item;
      }
      if (item.subcategorias && item.subcategorias.length > 0) {
        const encontrada = this.buscarSubcategoriaPorId(item.subcategorias, idSub);
        if (encontrada) return encontrada;
      }
    }
    return null;
  }
}
