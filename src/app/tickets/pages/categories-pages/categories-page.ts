import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';

import { Categoria } from '../../interfaces/categoria.mdoel';
import { Subcategoria, generateGUID } from '../../interfaces/subcategoria.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { CategoriesService } from '../../services/categories.service';
import { ResultadoFormularioNodo } from '../../interfaces/resultado-formulario-nodo.interface';

import { TarjetaGuiaMatrizComponent } from '../../components/tarjeta-guia-matriz/tarjeta-guia-matriz.component';
import { FormularioNodoCategoriaComponent } from '../../components/formulario-nodo-categoria/formulario-nodo-categoria.component';
import { NodoArbolCategoriaComponent } from '../../components/nodo-arbol-categoria/nodo-arbol-categoria.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    InputTextModule,
    TarjetaGuiaMatrizComponent,
    FormularioNodoCategoriaComponent,
    NodoArbolCategoriaComponent,
    PageHeaderComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './categories-page.html',
  styleUrl: './categories-page.scss'
})
export default class CategoriesPageComponent implements OnInit, OnDestroy {
  readonly String = String;
  usuario!: Usuario;
  areas: Area[] = [];
  areaSeleccionadaId: string = '1';
  categorias: Categoria[] = [];
  filtroTexto: string = '';

  mostrarGuiaMatriz: boolean = false;
  nodosExpandidosIds = new Set<string>();

  idNodoParaAgregar: string | null = null;
  idNodoEnEdicion: string | null = null;

  private subscripcionAreas?: Subscription;
  private subscripcionCategorias?: Subscription;

  constructor(
    private messageService: MessageService,
    private categoriesService: CategoriesService,
    private areasService: AreasService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const rawUser = localStorage.getItem('rwuserdatatk');
    if (rawUser) {
      this.usuario = JSON.parse(rawUser);
    }
    this.cargarAreas();
    this.cargarCategorias();
  }

  ngOnDestroy(): void {
    this.subscripcionAreas?.unsubscribe();
    this.subscripcionCategorias?.unsubscribe();
  }

  /* Carga de Datos */
  private cargarAreas(): void {
    this.subscripcionAreas = this.areasService.areas$.subscribe((areas: Area[]) => {
      this.areas = areas.filter((a: Area) => !a.eliminado);
      if (this.areas.length > 0 && !this.areas.some((a: Area) => String(a.id) === this.areaSeleccionadaId)) {
        this.areaSeleccionadaId = String(this.areas[0].id);
        this.cargarCategorias();
      }
      this.cdr.detectChanges();
    });
  }

  private cargarCategorias(): void {
    this.subscripcionCategorias?.unsubscribe();
    this.subscripcionCategorias = this.categoriesService.get(this.areaSeleccionadaId).subscribe({
      next: (cats) => {
        this.categorias = cats;
        this.categorias.forEach((c) => this.normalizarNodo(c));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  private normalizarNodo(nodo: Categoria | Subcategoria): void {
    if (!nodo.subcategorias) nodo.subcategorias = [];
    const tieneHijos = nodo.subcategorias.some((s) => !s.eliminado);
    if (!nodo.tipo) {
      nodo.tipo = tieneHijos || (nodo as any).activarSubcategorias ? 'rama' : 'hoja';
    }
    if (nodo.tipo === 'hoja' && !nodo.score) {
      nodo.urgencia = 2;
      nodo.score = 4;
      nodo.prioridad = 'Medio';
    }
    delete (nodo as any).estimacion;
    delete (nodo as any).slaRes;
    delete (nodo as any).slaResp;
    delete (nodo as any).impacto;

    nodo.subcategorias.forEach((h) => this.normalizarNodo(h));
  }

  /* Selector de Área */
  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    this.idNodoParaAgregar = null;
    this.idNodoEnEdicion = null;
    this.nodosExpandidosIds.clear();
    this.cargarCategorias();
  }

  get areaActual(): Area | undefined {
    return this.areas.find((a) => String(a.id) === this.areaSeleccionadaId);
  }

  /* Estadísticas y Conteo de Categorías */
  get totalCategoriasRaiz(): number {
    return this.categorias.filter((c) => !c.eliminado).length;
  }

  get totalCategoriasFinales(): number {
    const contarHojas = (n: Categoria | Subcategoria): number => {
      const tieneHijos = n.subcategorias && n.subcategorias.some((s) => !s.eliminado);
      if (n.tipo === 'hoja' || !tieneHijos) return 1;
      return (n.subcategorias || []).filter((h) => !h.eliminado).reduce((acc, h) => acc + contarHojas(h), 0);
    };
    return this.categorias.reduce((acc, cat) => acc + contarHojas(cat), 0);
  }

  get totalCategorias(): number {
    const contar = (n: Categoria | Subcategoria): number => {
      let c = 1;
      if (n.subcategorias) {
        n.subcategorias.filter((h) => !h.eliminado).forEach((h) => (c += contar(h)));
      }
      return c;
    };
    return this.categorias.reduce((acc, cat) => acc + contar(cat), 0);
  }

  /* Expansión del Árbol */
  estaExpandido(id: string | number): boolean {
    return this.nodosExpandidosIds.has(String(id));
  }

  alternarNodo(id: string | number): void {
    const idStr = String(id);
    if (this.nodosExpandidosIds.has(idStr)) {
      this.nodosExpandidosIds.delete(idStr);
    } else {
      this.nodosExpandidosIds.add(idStr);
    }
  }

  alternarExpandirTodos(): void {
    if (this.todosExpandidos) {
      this.nodosExpandidosIds.clear();
    } else {
      const recolectar = (n: Categoria | Subcategoria): void => {
        if (n.tipo === 'rama' || (n.subcategorias && n.subcategorias.some((s) => !s.eliminado))) {
          this.nodosExpandidosIds.add(String(n.id));
        }
        n.subcategorias?.filter((h) => !h.eliminado).forEach(recolectar);
      };
      this.categorias.forEach(recolectar);
    }
  }

  get todosExpandidos(): boolean {
    const ramas: string[] = [];
    const recolectar = (n: Categoria | Subcategoria): void => {
      if (n.tipo === 'rama' || (n.subcategorias && n.subcategorias.some((s) => !s.eliminado))) {
        ramas.push(String(n.id));
      }
      n.subcategorias?.filter((h) => !h.eliminado).forEach(recolectar);
    };
    this.categorias.forEach(recolectar);
    return ramas.length > 0 && ramas.every((id) => this.nodosExpandidosIds.has(id));
  }

  /* Búsqueda Jerárquica */
  buscarInfoNodo(idNodo: string): { nodo: Categoria | Subcategoria; padre: Categoria | Subcategoria | null; categoriaRaiz: Categoria } | null {
    const idBuscado = String(idNodo);
    for (const cat of this.categorias) {
      if (String(cat.id) === idBuscado) return { nodo: cat, padre: null, categoriaRaiz: cat };

      const buscar = (lista: Subcategoria[], p: Categoria | Subcategoria): any => {
        for (const sub of lista) {
          if (String(sub.id) === idBuscado) return { nodo: sub, padre: p, categoriaRaiz: cat };
          if (sub.subcategorias?.length) {
            const r = buscar(sub.subcategorias, sub);
            if (r) return r;
          }
        }
        return null;
      };
      if (cat.subcategorias?.length) {
        const res = buscar(cat.subcategorias, cat);
        if (res) return res;
      }
    }
    return null;
  }

  /* Control de Formularios In-line */
  abrirFormularioCrearRaiz(): void {
    this.idNodoEnEdicion = null;
    this.idNodoParaAgregar = this.idNodoParaAgregar === 'RAIZ' ? null : 'RAIZ';
  }

  abrirFormularioAgregarHijo(nodo: Categoria | Subcategoria): void {
    this.idNodoEnEdicion = null;
    this.idNodoParaAgregar = this.idNodoParaAgregar === String(nodo.id) ? null : String(nodo.id);
    this.nodosExpandidosIds.add(String(nodo.id));
  }

  abrirFormularioEditar(nodo: Categoria | Subcategoria): void {
    this.idNodoParaAgregar = null;
    this.idNodoEnEdicion = this.idNodoEnEdicion === String(nodo.id) ? null : String(nodo.id);
  }

  cancelarFormulario(): void {
    this.idNodoParaAgregar = null;
    this.idNodoEnEdicion = null;
  }

  /* Persistencia: Guardar y Editar */
  async guardarNuevoNodo(idPadre: string | null, datos: ResultadoFormularioNodo): Promise<void> {
    try {
      if (idPadre === null || idPadre === 'RAIZ') {
        const nuevoSecuencial = await this.categoriesService.obtenerSecuencial();
        const nuevaCat: Categoria = {
          id: nuevoSecuencial,
          idArea: parseInt(this.areaSeleccionadaId, 10),
          nombre: datos.nombre,
          eliminado: false,
          subcategorias: [],
          activarSubcategorias: datos.tipo === 'rama',
          tipo: datos.tipo,
          urgencia: datos.urgencia,
          score: datos.score,
          criticidad: datos.criticidad || datos.impacto || (datos.score && datos.urgencia ? Math.round(datos.score / datos.urgencia) : 2),
          prioridad: datos.prioridad as any
        };
        await this.categoriesService.create(nuevaCat);
        this.mostrarMensaje('success', 'Éxito', `Categoría "${datos.nombre}" creada.`);
      } else {
        const info = this.buscarInfoNodo(idPadre);
        if (!info) return;

        if (!info.nodo.subcategorias) info.nodo.subcategorias = [];
        const nuevaSub: Subcategoria = {
          id: generateGUID(),
          nombre: datos.nombre,
          eliminado: false,
          tipo: datos.tipo,
          subcategorias: [],
          activarSubcategorias: datos.tipo === 'rama',
          ...(datos.tipo === 'hoja' ? {
            urgencia: datos.urgencia,
            score: datos.score,
            criticidad: datos.criticidad || datos.impacto || (datos.score && datos.urgencia ? Math.round(datos.score / datos.urgencia) : 2),
            prioridad: datos.prioridad as any
          } : {})
        };
        info.nodo.subcategorias.push(nuevaSub);
        info.nodo.tipo = 'rama';
        info.nodo.activarSubcategorias = true;

        await this.categoriesService.update(info.categoriaRaiz, String(info.categoriaRaiz.id));
        this.mostrarMensaje('success', 'Éxito', `Subcategoría "${datos.nombre}" agregada.`);
        this.nodosExpandidosIds.add(String(info.nodo.id));
      }
      this.cancelarFormulario();
    } catch (err: any) {
      this.mostrarMensaje('error', 'Error', err.message || 'Error al guardar');
    }
  }

  async guardarEdicionNodo(idNodo: string, datos: ResultadoFormularioNodo): Promise<void> {
    const info = this.buscarInfoNodo(idNodo);
    if (!info) return;

    try {
      const objetivo = info.nodo;
      objetivo.nombre = datos.nombre;
      objetivo.tipo = datos.tipo;
      if (datos.tipo === 'hoja') {
        objetivo.urgencia = datos.urgencia;
        objetivo.score = datos.score;
        objetivo.criticidad = datos.criticidad || datos.impacto || (datos.score && datos.urgencia ? Math.round(datos.score / datos.urgencia) : 2);
        objetivo.prioridad = datos.prioridad as any;
      } else {
        objetivo.activarSubcategorias = true;
      }
      delete (objetivo as any).estimacion;
      delete (objetivo as any).slaRes;
      delete (objetivo as any).slaResp;
      delete (objetivo as any).impacto;

      await this.categoriesService.update(info.categoriaRaiz, String(info.categoriaRaiz.id));
      this.mostrarMensaje('success', 'Actualizado', `"${datos.nombre}" actualizado.`);
      this.cancelarFormulario();
    } catch (err: any) {
      this.mostrarMensaje('error', 'Error', err.message || 'Error al actualizar');
    }
  }

  /* Eliminación Recursiva */
  eliminarNodo(nodo: Categoria | Subcategoria): void {
    const info = this.buscarInfoNodo(String(nodo.id));
    if (!info) return;

    const tieneHijos = info.nodo.subcategorias && info.nodo.subcategorias.some((s) => !s.eliminado);
    const mensajeConfirmacion = tieneHijos
      ? `¿Estás seguro de eliminar "${nodo.nombre}"? También se eliminarán sus subcategorías descendientes.`
      : `¿Estás seguro de eliminar "${nodo.nombre}"?`;

    this.confirmationService.confirm({
      header: '¿Eliminar categoría?',
      message: mensajeConfirmacion,
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          const marcarEliminado = (n: Categoria | Subcategoria): void => {
            n.eliminado = true;
            n.subcategorias?.forEach(marcarEliminado);
          };
          marcarEliminado(info.nodo);

          if (!info.padre) {
            await this.categoriesService.delete(String(info.categoriaRaiz.id));
          } else {
            await this.categoriesService.update(info.categoriaRaiz, String(info.categoriaRaiz.id));
          }
          this.mostrarMensaje('success', 'Eliminado', `"${nodo.nombre}" eliminado.`);
        } catch (err: any) {
          this.mostrarMensaje('error', 'Error', err.message || 'Error al eliminar');
        }
      }
    });
  }

  private mostrarMensaje(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 3000 });
  }
}
