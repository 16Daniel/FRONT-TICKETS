import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { Categoria } from '../../models/categoria.model';
import { Subcategoria } from '../../interfaces/subcategoria.interface';
import { SeleccionArbolCategoria } from '../../interfaces/seleccion-arbol-categoria.interface';
import { crearSeleccionArbolCategoria } from '../../helpers/arbol-categorias.helper';

interface OpcionCategoriaRapida {
  nodo: Categoria | Subcategoria;
  rutaCompleta: string;
  seleccion: SeleccionArbolCategoria;
}

@Component({
  selector: 'app-selector-categorias-rapidas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-categorias-rapidas.component.html',
  styleUrl: './selector-categorias-rapidas.component.scss',
})
export class SelectorCategoriasRapidasComponent implements OnChanges {
  readonly String = String;

  @Input() idArea?: string | number;
  @Input() categorias: Categoria[] = [];

  @Output() alSeleccionar = new EventEmitter<SeleccionArbolCategoria>();
  @Output() alLimpiar = new EventEmitter<void>();

  opciones: OpcionCategoriaRapida[] = [];
  nodoSeleccionadoId: string | null = null;
  rutaSeleccionada = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idArea'] && !changes['idArea'].firstChange) {
      this.nodoSeleccionadoId = null;
      this.rutaSeleccionada = '';
    }

    this.actualizarOpciones();
  }

  seleccionar(opcion: OpcionCategoriaRapida): void {
    this.nodoSeleccionadoId = String(opcion.nodo.id);
    this.rutaSeleccionada = opcion.rutaCompleta;
    this.alSeleccionar.emit(opcion.seleccion);
  }

  limpiarSeleccion(): void {
    this.nodoSeleccionadoId = null;
    this.rutaSeleccionada = '';
    this.alLimpiar.emit();
  }

  private actualizarOpciones(): void {
    this.opciones = [];
    if (this.idArea === undefined || this.idArea === null || String(this.idArea).trim() === '') {
      return;
    }

    const categoriasArea = this.categorias.filter(
      (categoria) =>
        !categoria.eliminado &&
        String(categoria.idArea) === String(this.idArea)
    );

    for (const categoria of categoriasArea) {
      this.agregarOpcionesMarcadas(categoria, categoria, []);
    }

    if (
      this.nodoSeleccionadoId &&
      !this.opciones.some((opcion) => String(opcion.nodo.id) === this.nodoSeleccionadoId)
    ) {
      this.nodoSeleccionadoId = null;
      this.rutaSeleccionada = '';
    }
  }

  private agregarOpcionesMarcadas(
    nodo: Categoria | Subcategoria,
    categoriaRaiz: Categoria,
    rutaPadre: string[]
  ): void {
    if (nodo.eliminado) return;

    const ruta = [...rutaPadre, nodo.nombre];
    if (nodo.alertaWhatsapp === true) {
      this.opciones.push({
        nodo,
        rutaCompleta: ruta.join(' › '),
        seleccion: crearSeleccionArbolCategoria(nodo, categoriaRaiz, ruta),
      });
    }

    for (const subcategoria of nodo.subcategorias ?? []) {
      this.agregarOpcionesMarcadas(subcategoria, categoriaRaiz, ruta);
    }
  }
}
