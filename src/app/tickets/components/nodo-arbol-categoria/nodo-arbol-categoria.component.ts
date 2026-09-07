import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Categoria } from '../../interfaces/categoria.mdoel';
import { Subcategoria } from '../../interfaces/subcategoria.model';
import { clasificarCuadrante } from '../../helpers/matriz-criticidad.helper';
import { ResultadoFormularioNodo } from '../../interfaces/resultado-formulario-nodo.interface';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { MatrizAtencion } from '../../interfaces/matriz-atencion.interface';
import { FormularioNodoCategoriaComponent } from '../formulario-nodo-categoria/formulario-nodo-categoria.component';

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
  @Input() matrizAtencion?: MatrizAtencion | null = null;
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
    if (!nodo) return false;
    if (nodo.tipo === 'rama') return true;
    return Boolean(
      (nodo.subcategorias && nodo.subcategorias.some((s) => !s.eliminado)) ||
      nodo.activarSubcategorias
    );
  }

  obtenerHijosActivos(nodo: Categoria | Subcategoria): Subcategoria[] {
    if (!nodo || !nodo.subcategorias) return [];
    return nodo.subcategorias.filter((s) => !s.eliminado);
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
}
