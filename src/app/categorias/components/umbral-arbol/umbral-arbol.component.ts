import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { Categoria } from '../../models/categoria.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Subcategoria } from '../../interfaces/subcategoria.interface';

@Component({
  selector: 'app-umbral-arbol',
  standalone: true,
  imports: [CommonModule, OrganizationChartModule],
  templateUrl: './umbral-arbol.component.html',
  styleUrl: './umbral-arbol.component.scss'
})
export class UmbralArbolComponent implements OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() categoriasActuales: Categoria[] = [];
  @Input() areas: Area[] = [];
  @Input() areaSeleccionadaId: string = '';
  @Input() hasCategories: boolean = false;

  dataArbol: TreeNode[] = [];
  ticketCounts: { [key: string]: number } = {};

  zoomLevel: number = 1;
  @ViewChild('panContainer') panContainer?: ElementRef<HTMLElement>;

  isDragging = false;
  startX = 0;
  startY = 0;
  scrollLeft = 0;
  scrollTop = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickets'] || changes['categoriasActuales'] || changes['areaSeleccionadaId'] || changes['areas']) {
      this.procesarArbol();
    }
    if (changes['dataArbol'] || changes['categoriasActuales']) {
      this.centrarScroll();
    }
  }

  private procesarArbol(): void {
    if (!this.categoriasActuales || this.categoriasActuales.length === 0) {
      this.dataArbol = [];
      return;
    }

    // Contar tickets
    this.ticketCounts = {};
    if (this.tickets) {
      this.tickets.forEach(t => {
        const key = t.idSubcategoria || t.idCategoria;
        if (key) {
          this.ticketCounts[key] = (this.ticketCounts[key] || 0) + 1;
        }
      });
    }

    // Generar árbol
    const areaActual = this.areas.find(a => String(a.id) === String(this.areaSeleccionadaId));
    
    const nodoRaizArea: TreeNode = {
      label: areaActual ? areaActual.nombre : 'Área',
      type: 'area',
      expanded: true,
      data: { tipo: 'area' },
      children: this.categoriasActuales.filter((c: Categoria) => !c.eliminado).map((cat: Categoria) => this.mapearNodo(cat))
    };

    this.dataArbol = [nodoRaizArea];
  }

  private mapearNodo(nodo: Categoria | Subcategoria): TreeNode {
    const hijos = nodo.subcategorias ? nodo.subcategorias.filter((s: Subcategoria) => !s.eliminado) : [];
    const esRama = nodo.tipo === 'rama' || hijos.length > 0 || nodo.activarSubcategorias;

    return {
      label: nodo.nombre,
      type: esRama ? 'rama' : 'hoja',
      expanded: true,
      data: {
        nodo: nodo,
        esRama: esRama,
        ticketCount: !esRama ? (this.ticketCounts[String(nodo.id)] || 0) : 0
      },
      children: hijos.map((h: Subcategoria) => this.mapearNodo(h))
    };
  }

  centrarScroll(): void {
    setTimeout(() => {
      if (this.panContainer && this.panContainer.nativeElement) {
        const el = this.panContainer.nativeElement;
        if (el.scrollWidth > el.clientWidth) {
          el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        }
      }
    }, 100);
  }

  zoomIn(): void {
    if (this.zoomLevel < 2) {
      this.zoomLevel += 0.1;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.3) {
      this.zoomLevel -= 0.1;
    }
  }

  onMouseDown(e: MouseEvent, container: HTMLElement): void {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.startX = e.pageX - container.offsetLeft;
    this.startY = e.pageY - container.offsetTop;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;
  }

  onMouseLeave(): void {
    this.isDragging = false;
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onMouseMove(e: MouseEvent, container: HTMLElement): void {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = (x - this.startX) * 1.5;
    const walkY = (y - this.startY) * 1.5;
    container.scrollLeft = this.scrollLeft - walkX;
    container.scrollTop = this.scrollTop - walkY;
  }

  onWheel(e: WheelEvent): void {
    e.preventDefault();
    if (e.deltaY < 0) {
      this.zoomIn();
    } else if (e.deltaY > 0) {
      this.zoomOut();
    }
  }
}
