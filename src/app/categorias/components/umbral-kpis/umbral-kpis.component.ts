import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ticket } from '../../../tickets/interfaces/ticket.model';

@Component({
  selector: 'app-umbral-kpis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './umbral-kpis.component.html',
  styleUrl: './umbral-kpis.component.scss'
})
export class UmbralKpisComponent implements OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: any[] = [];
  @Input() usuariosRol4: any[] = [];
  @Input() isApplyingFilters: boolean = false;

  totalTickets: number = 0;
  categoriaTopTickets: { nombre: string, conteo: number } | null = null;
  usuarioTopTickets: { nombre: string, conteo: number } | null = null;
  sucursalTopTickets: { nombre: string, conteo: number } | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickets'] || changes['sucursales'] || changes['usuariosRol4']) {
      this.calcularKpis();
    }
  }

  private calcularKpis(): void {
    this.totalTickets = this.tickets.length;
    
    let maxTickets = 0;
    let topCatName = '';
    const nameCounts: { [name: string]: number } = {};

    let maxUsuarios = 0;
    let topUsuarioName = '';
    const userCounts: { [id: string]: number } = {};

    let maxSucursales = 0;
    let topSucursalName = '';
    const sucursalCounts: { [id: string]: number } = {};

    this.tickets.forEach(t => {
      // Top Categoría
      const catName = t.nombreSubcategoria || t.nombreCategoria || 'Sin Categoría';
      nameCounts[catName] = (nameCounts[catName] || 0) + 1;
      if (nameCounts[catName] > maxTickets) {
        maxTickets = nameCounts[catName];
        topCatName = catName;
      }

      // Top Usuario
      if (t.idResponsable) {
        const isRol4 = this.usuariosRol4.some(u => u.id === t.idResponsable);
        if (isRol4) {
          userCounts[t.idResponsable] = (userCounts[t.idResponsable] || 0) + 1;
          if (userCounts[t.idResponsable] > maxUsuarios) {
            maxUsuarios = userCounts[t.idResponsable];
            const u = this.usuariosRol4.find(x => x.id === t.idResponsable);
            topUsuarioName = u ? `${u.nombre} ${u.apellidoP}`.trim() : 'Desconocido';
          }
        }
      }

      // Top Sucursal
      if (t.idSucursal) {
        const sId = String(t.idSucursal);
        sucursalCounts[sId] = (sucursalCounts[sId] || 0) + 1;
        if (sucursalCounts[sId] > maxSucursales) {
          maxSucursales = sucursalCounts[sId];
          const s = this.sucursales.find(x => String(x.id) === sId);
          topSucursalName = s ? s.nombre : `Sucursal ${sId}`;
        }
      }
    });

    this.categoriaTopTickets = maxTickets > 0 ? { nombre: topCatName, conteo: maxTickets } : null;
    this.usuarioTopTickets = maxUsuarios > 0 ? { nombre: topUsuarioName, conteo: maxUsuarios } : null;
    this.sucursalTopTickets = maxSucursales > 0 ? { nombre: topSucursalName, conteo: maxSucursales } : null;
  }
}
