import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { Categoria } from '../../models/categoria.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Subcategoria } from '../../interfaces/subcategoria.interface';
import { TarjetaRendimientoSlaComponent, TotalesSlaDashboard } from '../../../tickets/components/tarjeta-rendimiento-sla/tarjeta-rendimiento-sla.component';
import { MatrizUrgenciaService } from '../../services/matriz-urgencia.service';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { KpiRadarService } from '../../../tickets/services/kpi-radar.service';

export interface ItemBusquedaUmbral {
  nodo: Categoria | Subcategoria;
  categoriaRaiz: Categoria;
  rutaCompleta: string;
  rutaIds: string[];
  esRama: boolean;
  ticketCount: number;
  isCritical: boolean;
}

export interface DetalleNodoSeleccionado {
  id: string;
  nombre: string;
  rutaCompleta: string;
  esRama: boolean;
  ticketCount: number;
  isCritical: boolean;
  prioridad?: string;
  hijosCount?: number;
  tiempoResolucion?: number;
  unidadResolucion?: string;
}

@Component({
  selector: 'app-umbral-arbol',
  standalone: true,
  imports: [CommonModule, FormsModule, TarjetaRendimientoSlaComponent],
  templateUrl: './umbral-arbol.component.html',
  styleUrl: './umbral-arbol.component.scss'
})
export class UmbralArbolComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tickets: Ticket[] = [];
  @Input() categoriasActuales: Categoria[] = [];
  @Input() areas: Area[] = [];
  @Input() areaSeleccionadaId: string = '';
  @Input() hasCategories: boolean = false;
  @Input() umbralAlerta: number = 5;

  ticketCounts: { [key: string]: number } = {};
  rutaNavegacionIds: string[] = [];
  busquedaTexto: string = '';

  nodoSeleccionado: DetalleNodoSeleccionado | null = null;

  totalesSlaNodo: TotalesSlaDashboard = {
    totalTickets: 0,
    totalTerminados: 0,
    slaAtencion: 0,
    slaAtencionCumplidos: 0,
    slaResolucion: 0,
    slaResolucionCumplidos: 0
  };

  private subscripcionMatriz?: Subscription;
  matrizUrgenciaArea?: MatrizUrgencia;

  constructor(
    private matrizUrgenciaService: MatrizUrgenciaService,
    private kpiRadarService: KpiRadarService
  ) {}

  ngOnInit(): void {
    this.cargarMatrizArea();
  }

  ngOnDestroy(): void {
    this.subscripcionMatriz?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tickets'] || changes['categoriasActuales'] || changes['areaSeleccionadaId'] || changes['umbralAlerta']) {
      this.procesarTickets();
    }
    if (changes['areaSeleccionadaId']) {
      this.rutaNavegacionIds = [];
      this.busquedaTexto = '';
      this.nodoSeleccionado = null;
      this.cargarMatrizArea();
    }
  }

  private cargarMatrizArea(): void {
    this.subscripcionMatriz?.unsubscribe();
    if (this.areaSeleccionadaId) {
      this.subscripcionMatriz = this.matrizUrgenciaService.obtenerMatrizPorArea(this.areaSeleccionadaId).subscribe(matriz => {
        this.matrizUrgenciaArea = matriz;
        if (this.nodoSeleccionado) {
          this.actualizarSlaNodoSeleccionado();
        }
      });
    }
  }

  private procesarTickets(): void {
    this.ticketCounts = {};
    if (this.tickets && this.tickets.length > 0) {
      this.tickets.forEach(t => {
        const key = t.idSubcategoria || t.idCategoria;
        if (key) {
          const kStr = String(key);
          this.ticketCounts[kStr] = (this.ticketCounts[kStr] || 0) + 1;
        }
      });
    }

    // Actualizar selección activa si existe
    if (this.nodoSeleccionado) {
      const tickets = this.contarTickets(this.nodoSeleccionado.id, this.nodoSeleccionado.esRama);
      this.nodoSeleccionado.ticketCount = tickets;
      this.nodoSeleccionado.isCritical = !this.nodoSeleccionado.esRama && tickets >= this.umbralAlerta;
      this.actualizarSlaNodoSeleccionado();
    }
  }

  obtenerAreaNombre(): string {
    const area = this.areas.find(a => String(a.id) === String(this.areaSeleccionadaId));
    return area ? area.nombre : 'Área seleccionada';
  }

  esRama(nodo: Categoria | Subcategoria): boolean {
    const hijos = (nodo.subcategorias || []).filter(s => !s.eliminado);
    return nodo.tipo === 'rama' || hijos.length > 0 || !!(nodo as any).activarSubcategorias;
  }

  contarTickets(id: string | number, esRama: boolean, nodoRef?: Categoria | Subcategoria): number {
    const idStr = String(id);
    if (!esRama) {
      return this.ticketCounts[idStr] || 0;
    }

    // Si es rama, sumar recursivamente los tickets de todos sus hijos hojas
    const nodo = nodoRef || this.buscarNodoPorId(idStr);
    if (!nodo) return 0;

    let total = 0;
    const sumarHojas = (item: Categoria | Subcategoria) => {
      const hijos = (item.subcategorias || []).filter(s => !s.eliminado);
      if (this.esRama(item) && hijos.length > 0) {
        hijos.forEach(h => sumarHojas(h));
      } else {
        total += this.ticketCounts[String(item.id)] || 0;
      }
    };

    sumarHojas(nodo);
    return total;
  }

  esCritico(nodo: Categoria | Subcategoria): boolean {
    const rama = this.esRama(nodo);
    if (!rama) {
      return this.contarTickets(nodo.id, false, nodo) >= this.umbralAlerta;
    }
    // Para ramas, es crítico si alguna hoja descendiente supera el umbral
    let tieneCritico = false;
    const evaluar = (item: Categoria | Subcategoria) => {
      if (tieneCritico) return;
      const hijos = (item.subcategorias || []).filter(s => !s.eliminado);
      if (this.esRama(item) && hijos.length > 0) {
        hijos.forEach(h => evaluar(h));
      } else {
        if ((this.ticketCounts[String(item.id)] || 0) >= this.umbralAlerta) {
          tieneCritico = true;
        }
      }
    };
    evaluar(nodo);
    return tieneCritico;
  }

  obtenerTotalHojasCriticas(): number {
    let count = 0;
    const evaluar = (item: Categoria | Subcategoria) => {
      if (item.eliminado) return;
      const hijos = (item.subcategorias || []).filter(s => !s.eliminado);
      if (this.esRama(item) && hijos.length > 0) {
        hijos.forEach(h => evaluar(h));
      } else {
        if ((this.ticketCounts[String(item.id)] || 0) >= this.umbralAlerta) {
          count++;
        }
      }
    };

    this.categoriasActuales.filter(c => !c.eliminado).forEach(c => evaluar(c));
    return count;
  }

  obtenerTotalTicketsArea(): number {
    let total = 0;
    const sumar = (item: Categoria | Subcategoria) => {
      if (item.eliminado) return;
      const hijos = (item.subcategorias || []).filter(s => !s.eliminado);
      if (this.esRama(item) && hijos.length > 0) {
        hijos.forEach(h => sumar(h));
      } else {
        total += (this.ticketCounts[String(item.id)] || 0);
      }
    };

    this.categoriasActuales.filter(c => !c.eliminado).forEach(c => sumar(c));
    return total;
  }

  /* Navegación por Migas de Pan (Breadcrumbs) */
  obtenerRutaActual(): Array<{ id: string; nombre: string }> {
    const ruta: Array<{ id: string; nombre: string }> = [];
    let listaActual: Array<Categoria | Subcategoria> = this.categoriasActuales.filter(c => !c.eliminado);

    for (const id of this.rutaNavegacionIds) {
      const encontrado = listaActual.find(n => String(n.id) === id);
      if (encontrado) {
        ruta.push({ id: String(encontrado.id), nombre: encontrado.nombre });
        listaActual = (encontrado.subcategorias || []).filter(s => !s.eliminado);
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

  subirNivel(): void {
    if (this.rutaNavegacionIds.length > 0) {
      this.rutaNavegacionIds.pop();
    }
  }

  obtenerHijosNivelActual(): Array<Categoria | Subcategoria> {
    const catsActivas = this.categoriasActuales.filter(c => !c.eliminado);
    if (this.rutaNavegacionIds.length === 0) {
      return catsActivas;
    }

    let lista: Array<Categoria | Subcategoria> = catsActivas;
    for (const id of this.rutaNavegacionIds) {
      const actual = lista.find(n => String(n.id) === id);
      if (!actual) return [];
      lista = (actual.subcategorias || []).filter(s => !s.eliminado);
    }
    return lista;
  }

  profundizarRama(nodo: Categoria | Subcategoria): void {
    this.rutaNavegacionIds.push(String(nodo.id));
  }

  estaNodoSeleccionado(id: string | number): boolean {
    return this.nodoSeleccionado?.id === String(id);
  }

  seleccionarNodo(nodo: Categoria | Subcategoria, rutaCompletaPersonalizada?: string): void {
    const rama = this.esRama(nodo);
    const count = this.contarTickets(nodo.id, rama, nodo);
    const ruta = rutaCompletaPersonalizada || this.construirRutaTexto(nodo);

    this.nodoSeleccionado = {
      id: String(nodo.id),
      nombre: nodo.nombre,
      rutaCompleta: ruta,
      esRama: rama,
      ticketCount: count,
      isCritical: !rama && count >= this.umbralAlerta,
      prioridad: nodo.prioridad,
      hijosCount: (nodo.subcategorias || []).filter(s => !s.eliminado).length,
      tiempoResolucion: nodo.tiempoResolucion,
      unidadResolucion: nodo.unidadResolucion
    };

    this.actualizarSlaNodoSeleccionado();
  }

  seleccionarDesdeBusqueda(item: ItemBusquedaUmbral): void {
    this.seleccionarNodo(item.nodo, item.rutaCompleta);
    if (item.esRama) {
      this.profundizarRama(item.nodo);
      this.busquedaTexto = '';
    }
  }

  limpiarSeleccion(): void {
    this.nodoSeleccionado = null;
    this.totalesSlaNodo = {
      totalTickets: 0,
      totalTerminados: 0,
      slaAtencion: 0,
      slaAtencionCumplidos: 0,
      slaResolucion: 0,
      slaResolucionCumplidos: 0
    };
  }

  obtenerTicketsNodo(id: string | number, esRama: boolean, nodoRef?: Categoria | Subcategoria): Ticket[] {
    if (!this.tickets || this.tickets.length === 0) return [];

    const idStr = String(id);
    if (!esRama) {
      return this.tickets.filter(t => String(t.idSubcategoria || t.idCategoria) === idStr);
    }

    const nodo = nodoRef || this.buscarNodoPorId(idStr);
    if (!nodo) {
      return this.tickets.filter(t => String(t.idCategoria) === idStr || String(t.idSubcategoria) === idStr);
    }

    const idsSet = new Set<string>();
    idsSet.add(idStr);

    const recolectarIds = (item: Categoria | Subcategoria) => {
      idsSet.add(String(item.id));
      const hijos = (item.subcategorias || []).filter(s => !s.eliminado);
      hijos.forEach(h => recolectarIds(h));
    };

    recolectarIds(nodo);

    return this.tickets.filter(t => {
      const ticketIdKey = String(t.idSubcategoria || t.idCategoria || '');
      const catId = String(t.idCategoria || '');
      return idsSet.has(ticketIdKey) || idsSet.has(catId);
    });
  }

  calcularSlaTickets(ticketsNodo: Ticket[]): TotalesSlaDashboard {
    const totalTickets = ticketsNodo.length;
    const terminados = ticketsNodo.filter(t => String(t.idEstatusTicket) === '3');
    const totalTerminados = terminados.length;

    let slaAtencionCumplidos = 0;
    let slaResolucionCumplidos = 0;

    terminados.forEach(t => {
      const evalSla = this.kpiRadarService.evaluarSlaTicket(t, this.matrizUrgenciaArea);
      if (evalSla.atencion) {
        slaAtencionCumplidos++;
      }
      if (evalSla.resolucion) {
        slaResolucionCumplidos++;
      }
    });

    const slaAtencion = totalTerminados > 0
      ? (slaAtencionCumplidos / totalTerminados) * 100
      : 0;

    const slaResolucion = totalTerminados > 0
      ? (slaResolucionCumplidos / totalTerminados) * 100
      : 0;

    return {
      totalTickets,
      totalTerminados,
      slaAtencion,
      slaAtencionCumplidos,
      slaResolucion,
      slaResolucionCumplidos
    };
  }

  private actualizarSlaNodoSeleccionado(): void {
    if (!this.nodoSeleccionado) return;
    const ticketsNodo = this.obtenerTicketsNodo(this.nodoSeleccionado.id, this.nodoSeleccionado.esRama);
    this.totalesSlaNodo = this.calcularSlaTickets(ticketsNodo);
  }

  private construirRutaTexto(nodo: Categoria | Subcategoria): string {
    const rutaNombres: string[] = [];
    const area = this.obtenerAreaNombre();
    rutaNombres.push(area);

    this.obtenerRutaActual().forEach(p => rutaNombres.push(p.nombre));
    if (!rutaNombres.includes(nodo.nombre)) {
      rutaNombres.push(nodo.nombre);
    }
    return rutaNombres.join(' › ');
  }

  private buscarNodoPorId(idStr: string): Categoria | Subcategoria | null {
    const buscar = (lista: Array<Categoria | Subcategoria>): Categoria | Subcategoria | null => {
      for (const item of lista) {
        if (item.eliminado) continue;
        if (String(item.id) === idStr) return item;
        if (item.subcategorias && item.subcategorias.length > 0) {
          const res = buscar(item.subcategorias);
          if (res) return res;
        }
      }
      return null;
    };

    return buscar(this.categoriasActuales);
  }

  /* Búsqueda Predictiva Aplanada */
  obtenerResultadosBusqueda(): ItemBusquedaUmbral[] {
    const termino = this.busquedaTexto.trim().toLowerCase();
    if (!termino) return [];

    const resultados: ItemBusquedaUmbral[] = [];
    const catsActivas = this.categoriasActuales.filter(c => !c.eliminado);

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
        const hijosActivos = (n.subcategorias || []).filter(s => !s.eliminado);
        const rama = this.esRama(n);
        const rutaCompleta = nuevosNombres.join(' › ');

        if (n.nombre.toLowerCase().includes(termino) || rutaCompleta.toLowerCase().includes(termino)) {
          const tickets = this.contarTickets(n.id, rama, n);
          resultados.push({
            nodo: n,
            categoriaRaiz: raiz,
            rutaCompleta,
            rutaIds: nuevosIds,
            esRama: rama,
            ticketCount: tickets,
            isCritical: !rama && tickets >= this.umbralAlerta
          });
        }

        if (rama && hijosActivos.length > 0) {
          recorrer(hijosActivos, raiz, nuevosNombres, nuevosIds);
        }
      }
    };

    for (const raiz of catsActivas) {
      const hijosRaiz = (raiz.subcategorias || []).filter(s => !s.eliminado);
      const ramaRaiz = this.esRama(raiz);
      const ticketsRaiz = this.contarTickets(raiz.id, ramaRaiz, raiz);

      if (raiz.nombre.toLowerCase().includes(termino)) {
        resultados.push({
          nodo: raiz,
          categoriaRaiz: raiz,
          rutaCompleta: raiz.nombre,
          rutaIds: [String(raiz.id)],
          esRama: ramaRaiz,
          ticketCount: ticketsRaiz,
          isCritical: !ramaRaiz && ticketsRaiz >= this.umbralAlerta
        });
      }

      if (ramaRaiz && hijosRaiz.length > 0) {
        recorrer(hijosRaiz, raiz, [raiz.nombre], [String(raiz.id)]);
      }
    }

    return resultados;
  }
}
