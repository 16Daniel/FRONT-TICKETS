import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Categoria } from '../../models/categoria.model';
import { Subcategoria } from '../../interfaces/subcategoria.interface';
import { clasificarCuadrante, obtenerTiempoSla } from '../../../tickets/helpers/matriz-criticidad.helper';
import { ResultadoFormularioNodo } from '../../interfaces/resultado-formulario-nodo.interface';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { FormularioNodoCategoriaComponent } from '../formulario-nodo-categoria/formulario-nodo-categoria.component';
import { esNodoRama, obtenerHijosOrdenadosRama } from '../../helpers/arbol-categorias.helper';

@Component({
  selector: 'app-nodo-arbol-categoria',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    FormularioNodoCategoriaComponent,
    forwardRef(() => NodoArbolCategoriaComponent)
  ],
  templateUrl: './nodo-arbol-categoria.component.html',
  styleUrl: './nodo-arbol-categoria.component.scss'
})
export class NodoArbolCategoriaComponent {
  @Input() nodo!: Categoria | Subcategoria;
  @Input() profundidad: number = 0;
  @Input() categoriaRaiz!: Categoria;
  @Input() idArea?: string = '';
  @Input() matrizUrgencia?: MatrizUrgencia | null = null;
  @Input() estaExpandido: boolean = false;
  @Input() filtroTexto: string = '';
  @Input() idNodoEnEdicion: string | null = null;
  @Input() idNodoParaAgregar: string | null = null;
  @Input() nodosExpandidosIds = new Set<string>();

  @Output() alternarNodo = new EventEmitter<string>();
  @Output() abrirCrearHijo = new EventEmitter<Categoria | Subcategoria>();
  @Output() abrirEditar = new EventEmitter<Categoria | Subcategoria>();
  @Output() eliminar = new EventEmitter<Categoria | Subcategoria>();
  @Output() guardarHijo = new EventEmitter<{ parentId: string; datos: ResultadoFormularioNodo }>();
  @Output() guardarEdicion = new EventEmitter<{ nodoId: string; datos: ResultadoFormularioNodo }>();
  @Output() cancelarFormulario = new EventEmitter<void>();

  readonly clasificarCuadrante = clasificarCuadrante;

  esRama(nodo: Categoria | Subcategoria): boolean {
    return esNodoRama(nodo);
  }

  obtenerHijosActivos(nodo: Categoria | Subcategoria): Subcategoria[] {
    return obtenerHijosOrdenadosRama(nodo);
  }

  hijoEstaExpandido(idHijo: string | any): boolean {
    return this.nodosExpandidosIds.has(String(idHijo));
  }

  coincideFiltro(nodo: Categoria | Subcategoria): boolean {
    if (!this.filtroTexto || !this.filtroTexto.trim()) return true;
    const busqueda = this.filtroTexto.toLowerCase().trim();
    const verificar = (n: Categoria | Subcategoria): boolean => {
      if (n.nombre.toLowerCase().includes(busqueda)) return true;
      if (n.subcategorias) {
        return n.subcategorias.some((s) => !s.eliminado && verificar(s));
      }
      return false;
    };
    return verificar(nodo);
  }

  alGuardarHijo(datos: ResultadoFormularioNodo): void {
    this.guardarHijo.emit({ parentId: String(this.nodo.id), datos });
  }

  alGuardarEdicion(datos: ResultadoFormularioNodo): void {
    this.guardarEdicion.emit({ nodoId: String(this.nodo.id), datos });
  }

  obtenerLabelTiempoResolucion(nodo: Categoria | Subcategoria): string {
    if (nodo.tiempoResolucion) {
      return `${nodo.tiempoResolucion} ${nodo.unidadResolucion || 'h'}`;
    }
    if (nodo.horasResolucion) {
      if (nodo.horasResolucion < 1) {
        return `${Math.round(nodo.horasResolucion * 60)} m`;
      }
      if (nodo.horasResolucion >= 24 && nodo.horasResolucion % 24 === 0) {
        return `${nodo.horasResolucion / 24} d`;
      }
      return `${nodo.horasResolucion} h`;
    }
    return '';
  }

  obtenerLabelTiempoAtencion(nodo: Categoria | Subcategoria): string {
    let imp = (nodo as any).impacto || nodo.criticidad;
    if (!imp || imp > 3) {
      if (nodo.score && nodo.urgencia) {
        imp = Math.round(nodo.score / nodo.urgencia);
      } else if (nodo.prioridad) {
        const p = nodo.prioridad.toUpperCase();
        imp = p.includes('CRÍT') || p.includes('CRIT') ? 3 : p.includes('ALT') ? 3 : p.includes('MED') ? 2 : 1;
      } else {
        imp = 2;
      }
    }
    const impacto = Math.min(3, Math.max(1, imp || 2));
    const urgencia = Math.min(3, Math.max(1, nodo.urgencia || 2));

    if (this.matrizUrgencia && this.matrizUrgencia.celdas?.length) {
      const celda = this.matrizUrgencia.celdas.find(
        (c) => c.impacto === impacto && c.urgencia === urgencia
      );
      if (celda) {
        return celda.label || `${celda.valor} ${celda.unidad}`;
      }
    }

    return obtenerTiempoSla(impacto, urgencia).label;
  }
}
