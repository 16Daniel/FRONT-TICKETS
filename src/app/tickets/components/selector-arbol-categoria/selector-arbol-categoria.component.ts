import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Categoria } from '../../interfaces/categoria.mdoel';
import { Subcategoria } from '../../interfaces/subcategoria.model';
import { CategoriesService } from '../../services/categories.service';
import { SeleccionArbolCategoria } from '../../interfaces/seleccion-arbol-categoria.interface';

@Component({
  selector: 'app-selector-arbol-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-arbol-categoria.component.html',
  styleUrl: './selector-arbol-categoria.component.scss',
})
export class SelectorArbolCategoriaComponent implements OnInit, OnChanges, OnDestroy {
  readonly String = String;

  @Input() idArea?: string | number;
  @Input() categoriasExternas?: Categoria[];
  @Input() idCategoriaInicial?: string | null;
  @Input() idSubcategoriaInicial?: string | null;

  @Output() alSeleccionar = new EventEmitter<SeleccionArbolCategoria>();
  @Output() alLimpiar = new EventEmitter<void>();

  categoriasArea: Categoria[] = [];
  rutaNavegacionIds: string[] = [];
  busquedaTexto: string = '';

  nodoSeleccionadoId: string | null = null;
  nodoSeleccionado: SeleccionArbolCategoria | null = null;

  private subscripcionCategorias?: Subscription;

  estaNodoSeleccionado(id: string | number): boolean {
    return this.nodoSeleccionadoId === String(id);
  }

  constructor(
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.categoriasExternas && this.categoriasExternas.length > 0) {
      this.procesarCategorias(this.categoriasExternas);
    } else if (this.idArea) {
      this.cargarCategorias();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idArea'] && !changes['idArea'].firstChange) {
      this.limpiarSeleccion();
      this.rutaNavegacionIds = [];
      this.busquedaTexto = '';
      if (!this.categoriasExternas) {
        this.cargarCategorias();
      } else {
        this.filtrarCategoriasPorArea();
      }
    }

    if (changes['categoriasExternas'] && this.categoriasExternas) {
      this.filtrarCategoriasPorArea();
    }

    if (changes['idCategoriaInicial'] || changes['idSubcategoriaInicial']) {
      this.restaurarSeleccionInicial();
    }
  }

  ngOnDestroy(): void {
    this.subscripcionCategorias?.unsubscribe();
  }

  /* Carga y Filtrado de Categorías */
  private cargarCategorias(): void {
    this.subscripcionCategorias?.unsubscribe();
    const areaIdStr = this.idArea ? String(this.idArea) : undefined;
    this.subscripcionCategorias = this.categoriesService.get(areaIdStr).subscribe({
      next: (cats) => {
        this.procesarCategorias(cats);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías en selector:', err),
    });
  }

  private filtrarCategoriasPorArea(): void {
    if (!this.categoriasExternas) return;
    const catsFiltradas = this.idArea
      ? this.categoriasExternas.filter((c) => String(c.idArea) === String(this.idArea))
      : this.categoriasExternas;
    this.procesarCategorias(catsFiltradas);
  }

  private procesarCategorias(cats: Categoria[]): void {
    this.categoriasArea = cats.filter((c) => !c.eliminado);
    this.categoriasArea.forEach((c) => this.normalizarNodo(c));
    this.restaurarSeleccionInicial();
  }

  private normalizarNodo(nodo: Categoria | Subcategoria): void {
    if (!nodo.subcategorias) nodo.subcategorias = [];
    const tieneHijos = nodo.subcategorias.some((s) => !s.eliminado);
    if (!nodo.tipo) {
      nodo.tipo = tieneHijos || (nodo as any).activarSubcategorias ? 'rama' : 'hoja';
    }
    if (nodo.tipo === 'hoja') {
      if (!nodo.prioridadUrgencia && !(nodo as any).prioridad) {
        nodo.prioridadUrgencia = 'Medio';
      } else if (!nodo.prioridadUrgencia && (nodo as any).prioridad) {
        nodo.prioridadUrgencia = (nodo as any).prioridad;
      }
    }
    nodo.subcategorias.forEach((h) => this.normalizarNodo(h));
  }

  /* Navegación por Migas de Pan (Breadcrumbs) */
  obtenerRutaActual(): Array<{ id: string; nombre: string }> {
    const ruta: Array<{ id: string; nombre: string }> = [];
    let listaActual: Array<Categoria | Subcategoria> = this.categoriasArea;

    for (const id of this.rutaNavegacionIds) {
      const encontrado = listaActual.find((n) => String(n.id) === id);
      if (encontrado) {
        ruta.push({ id: String(encontrado.id), nombre: encontrado.nombre });
        listaActual = (encontrado.subcategorias || []).filter((s) => !s.eliminado);
      }
    }
    return ruta;
  }

  navegarNivel(indice: number): void {
    if (indice < 0) {
      this.rutaNavegacionIds = [];
    } else {
      this.rutaNavegacionIds = this.rutaNavegacionIds.slice(0, indice + 1);
    }
  }

  obtenerHijosNivelActual(): Array<Categoria | Subcategoria> {
    if (this.rutaNavegacionIds.length === 0) {
      return this.categoriasArea;
    }
    let actual: Categoria | Subcategoria | null = null;
    let lista: Array<Categoria | Subcategoria> = this.categoriasArea;

    for (const id of this.rutaNavegacionIds) {
      actual = lista.find((n) => String(n.id) === id) || null;
      if (!actual) return [];
      lista = (actual.subcategorias || []).filter((s) => !s.eliminado);
    }
    return lista;
  }

  esRama(nodo: Categoria | Subcategoria): boolean {
    const tieneHijos = !!(nodo.subcategorias && nodo.subcategorias.some((s) => !s.eliminado));
    return nodo.tipo === 'rama' || tieneHijos || (nodo as any).activarSubcategorias;
  }

  profundizarRama(nodo: Categoria | Subcategoria): void {
    this.rutaNavegacionIds.push(String(nodo.id));
  }

  /* Búsqueda Rápida Aplanada */
  obtenerResultadosBusqueda(): Array<{
    nodo: Categoria | Subcategoria;
    categoriaRaiz: Categoria;
    rutaCompleta: string;
    rutaIds: string[];
  }> {
    const termino = this.busquedaTexto.trim().toLowerCase();
    if (!termino) return [];

    const hojas: Array<{
      nodo: Categoria | Subcategoria;
      categoriaRaiz: Categoria;
      rutaCompleta: string;
      rutaIds: string[];
    }> = [];

    const recorrer = (
      nodos: Array<Categoria | Subcategoria>,
      raiz: Categoria,
      nombresTrail: string[],
      idsTrail: string[]
    ) => {
      for (const n of nodos) {
        if (n.eliminado) continue;
        const nuevosNombres = [...nombresTrail, n.nombre];
        const nuevosIds = [...idsTrail, String(n.id)];
        const hijosActivos = (n.subcategorias || []).filter((s) => !s.eliminado);

        if (this.esRama(n) && hijosActivos.length > 0) {
          recorrer(hijosActivos, raiz, nuevosNombres, nuevosIds);
        } else {
          // Es hoja
          const rutaCompleta = nuevosNombres.join(' › ');
          if (rutaCompleta.toLowerCase().includes(termino)) {
            hojas.push({
              nodo: n,
              categoriaRaiz: raiz,
              rutaCompleta,
              rutaIds: nuevosIds,
            });
          }
        }
      }
    };

    for (const raiz of this.categoriasArea) {
      if (raiz.eliminado) continue;
      const hijosRaiz = (raiz.subcategorias || []).filter((s) => !s.eliminado);
      if (this.esRama(raiz) && hijosRaiz.length > 0) {
        recorrer(hijosRaiz, raiz, [raiz.nombre], [String(raiz.id)]);
      } else {
        if (raiz.nombre.toLowerCase().includes(termino)) {
          hojas.push({
            nodo: raiz,
            categoriaRaiz: raiz,
            rutaCompleta: raiz.nombre,
            rutaIds: [String(raiz.id)],
          });
        }
      }
    }

    return hojas;
  }

  /* Selección de Categoría Hoja */
  seleccionarHoja(
    nodo: Categoria | Subcategoria,
    categoriaRaiz?: Categoria,
    rutaIds?: string[]
  ): void {
    let raiz = categoriaRaiz;
    let rutaNombres: string[] = [];

    if (!raiz) {
      const encontrada = this.buscarRaizYNombres(String(nodo.id));
      if (encontrada) {
        raiz = encontrada.raiz;
        rutaNombres = encontrada.nombres;
      } else {
        raiz = nodo as Categoria;
        rutaNombres = [nodo.nombre];
      }
    } else {
      const encontrada = this.buscarRaizYNombres(String(nodo.id));
      rutaNombres = encontrada ? encontrada.nombres : [raiz.nombre, nodo.nombre];
    }

    const esSub = String(raiz.id) !== String(nodo.id);
    const rutaCompleta = rutaNombres.join(' › ');

    this.nodoSeleccionadoId = String(nodo.id);
    this.nodoSeleccionado = {
      categoria: raiz,
      subcategoria: esSub ? (nodo as Subcategoria) : undefined,
      idCategoria: String(raiz.id),
      idSubcategoria: esSub ? String(nodo.id) : null,
      nombreCategoria: raiz.nombre,
      nombreSubcategoria: esSub ? nodo.nombre : null,
      rutaCompleta,
      prioridad: nodo.prioridadUrgencia || (nodo as any).prioridad || 'Medio',
      prioridadAtencion: nodo.prioridadAtencion || raiz.prioridadAtencion || 'Medio',
      score: nodo.score || 4,
    };

    this.alSeleccionar.emit(this.nodoSeleccionado);
  }

  limpiarSeleccion(): void {
    this.nodoSeleccionadoId = null;
    this.nodoSeleccionado = null;
    this.alLimpiar.emit();
  }

  private buscarRaizYNombres(
    idBuscado: string
  ): { raiz: Categoria; nombres: string[] } | null {
    for (const raiz of this.categoriasArea) {
      if (String(raiz.id) === idBuscado) {
        return { raiz, nombres: [raiz.nombre] };
      }

      const buscar = (
        lista: Subcategoria[],
        nombresTrail: string[]
      ): { raiz: Categoria; nombres: string[] } | null => {
        for (const sub of lista) {
          if (sub.eliminado) continue;
          const trail = [...nombresTrail, sub.nombre];
          if (String(sub.id) === idBuscado) {
            return { raiz, nombres: trail };
          }
          if (sub.subcategorias?.length) {
            const res = buscar(sub.subcategorias, trail);
            if (res) return res;
          }
        }
        return null;
      };

      if (raiz.subcategorias?.length) {
        const res = buscar(raiz.subcategorias, [raiz.nombre]);
        if (res) return res;
      }
    }
    return null;
  }

  private restaurarSeleccionInicial(): void {
    if (!this.categoriasArea.length) return;
    const idBuscar = this.idSubcategoriaInicial || this.idCategoriaInicial;
    if (!idBuscar) return;

    const res = this.buscarRaizYNombres(String(idBuscar));
    if (res) {
      let objetivo: Categoria | Subcategoria = res.raiz;
      if (this.idSubcategoriaInicial) {
        const buscarSub = (lista: Subcategoria[]): Subcategoria | null => {
          for (const s of lista) {
            if (String(s.id) === String(this.idSubcategoriaInicial)) return s;
            if (s.subcategorias?.length) {
              const r = buscarSub(s.subcategorias);
              if (r) return r;
            }
          }
          return null;
        };
        const sub = buscarSub(res.raiz.subcategorias || []);
        if (sub) objetivo = sub;
      }
      this.seleccionarHoja(objetivo, res.raiz);
    }
  }

  obtenerClasePrioridad(prioridad?: string): string {
    switch (prioridad) {
      case 'Crítico':
        return 'prioridad-critico';
      case 'Alto':
        return 'prioridad-alto';
      case 'Medio':
        return 'prioridad-medio';
      case 'Bajo':
        return 'prioridad-bajo';
      default:
        return 'prioridad-medio';
    }
  }
}
