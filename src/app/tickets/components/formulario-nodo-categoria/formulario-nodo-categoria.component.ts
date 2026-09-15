import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../interfaces/categoria.mdoel';
import { Subcategoria } from '../../interfaces/subcategoria.model';
import { ResultadoFormularioNodo } from '../../interfaces/resultado-formulario-nodo.interface';
import { EventoSeleccionMatriz } from '../../interfaces/evento-seleccion-matriz.interface';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';

import { SelectorMatrizCriticidadComponent } from '../selector-matriz-criticidad/selector-matriz-criticidad.component';


@Component({
  selector: 'app-formulario-nodo-categoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectorMatrizCriticidadComponent,
    
  ],
  templateUrl: './formulario-nodo-categoria.component.html',
  styleUrl: './formulario-nodo-categoria.component.scss'
})
export class FormularioNodoCategoriaComponent implements OnInit {
  @Input() modo: 'crear-raiz' | 'crear-hijo' | 'editar' = 'crear-raiz';
  @Input() nombrePadre?: string = '';
  @Input() nombreArea?: string = '';
  @Input() idArea?: string = '';
  @Input() matrizUrgencia?: MatrizUrgencia | null = null;

  @Input() nodoEditar?: Categoria | Subcategoria;
  @Input() bloquearCambioTipo: boolean = false;
  @Input() esAnidado: boolean = false;

  @Output() guardar = new EventEmitter<ResultadoFormularioNodo>();
  @Output() cancelar = new EventEmitter<void>();

  nombre: string = '';
  tipo: 'rama' | 'hoja' = 'rama';
  impacto: number = 2;
  urgencia: number = 2;
  score: number = 4;
  prioridad: string = 'Medio';

  // Configuración del Tiempo de Resolución
  tiempoResolucion: number = 24;
  unidadResolucion: 'm' | 'h' | 'd' = 'h';

  readonly presetsTiempo = [
    { valor: 15, unidad: 'm' as const, label: '15 m' },
    { valor: 30, unidad: 'm' as const, label: '30 m' },
    { valor: 1, unidad: 'h' as const, label: '1 h' },
    { valor: 2, unidad: 'h' as const, label: '2 h' },
    { valor: 4, unidad: 'h' as const, label: '4 h' },
    { valor: 8, unidad: 'h' as const, label: '8 h' },
    { valor: 1, unidad: 'd' as const, label: '1 d (24 h)' },
    { valor: 2, unidad: 'd' as const, label: '2 d (48 h)' },
    { valor: 3, unidad: 'd' as const, label: '3 d (72 h)' }
  ];

  ngOnInit(): void {
    if (this.modo === 'editar' && this.nodoEditar) {
      this.nombre = this.nodoEditar.nombre || '';
      this.tipo = this.nodoEditar.tipo || 'rama';
      this.urgencia = this.nodoEditar.urgencia || 2;
      this.score = this.nodoEditar.score || 4;
      this.prioridad = this.nodoEditar.prioridad || 'Medio';

      // Cargar tiempo de resolución configurado
      if (this.nodoEditar.tiempoResolucion) {
        this.tiempoResolucion = this.nodoEditar.tiempoResolucion;
        this.unidadResolucion = this.nodoEditar.unidadResolucion || 'h';
      } else if (this.nodoEditar.horasResolucion) {
        if (this.nodoEditar.horasResolucion < 1) {
          this.tiempoResolucion = Math.round(this.nodoEditar.horasResolucion * 60);
          this.unidadResolucion = 'm';
        } else if (this.nodoEditar.horasResolucion >= 24 && this.nodoEditar.horasResolucion % 24 === 0) {
          this.tiempoResolucion = this.nodoEditar.horasResolucion / 24;
          this.unidadResolucion = 'd';
        } else {
          this.tiempoResolucion = this.nodoEditar.horasResolucion;
          this.unidadResolucion = 'h';
        }
      } else {
        this.tiempoResolucion = 24;
        this.unidadResolucion = 'h';
      }

      // Resolver impacto/criticidad de urgencia (1, 2 o 3)
      let imp = (this.nodoEditar as any).impacto || this.nodoEditar.criticidad;
      if (!imp || imp > 3) {
        if (this.nodoEditar.score && this.nodoEditar.urgencia) {
          imp = Math.round(this.nodoEditar.score / this.nodoEditar.urgencia);
        } else if (this.nodoEditar.prioridad) {
          const p = this.nodoEditar.prioridad.toUpperCase();
          imp = p.includes('CRÍT') || p.includes('CRIT') ? 3 : p.includes('ALT') ? 3 : p.includes('MED') ? 2 : 1;
        } else {
          imp = 2;
        }
      }
      this.impacto = Math.min(3, Math.max(1, imp || 2));
    } else if (this.modo === 'crear-hijo') {
      this.tipo = 'hoja';
      this.tiempoResolucion = 24;
      this.unidadResolucion = 'h';
    }
  }

  seleccionarPreset(valor: number, unidad: 'm' | 'h' | 'd'): void {
    this.tiempoResolucion = valor;
    this.unidadResolucion = unidad;
  }

  esPresetActivo(valor: number, unidad: 'm' | 'h' | 'd'): boolean {
    return Number(this.tiempoResolucion) === valor && this.unidadResolucion === unidad;
  }

  get horasResolucionCalculadas(): number {
    const val = Number(this.tiempoResolucion) || 0;
    if (this.unidadResolucion === 'm') {
      return Math.round((val / 60) * 100) / 100;
    }
    if (this.unidadResolucion === 'd') {
      return val * 24;
    }
    return val;
  }

  get resumenTiempoResolucion(): string {
    const val = Number(this.tiempoResolucion) || 0;
    if (this.unidadResolucion === 'm') {
      const horas = (val / 60).toFixed(2).replace(/\.?0+$/, '');
      return `${val} ${val === 1 ? 'minuto' : 'minutos'} (${horas} h)`;
    }
    if (this.unidadResolucion === 'd') {
      const horas = val * 24;
      return `${val} ${val === 1 ? 'día' : 'días'} (${horas} h)`;
    }
    if (val >= 24 && val % 24 === 0) {
      const dias = val / 24;
      return `${val} h (${dias} ${dias === 1 ? 'día' : 'días'})`;
    }
    return `${val} horas`;
  }

  alCambiarMatriz(evento: EventoSeleccionMatriz): void {
    this.impacto = evento.impacto;
    this.urgencia = evento.urgencia;
    this.score = evento.score;
    this.prioridad = evento.prioridad;
  }

  alGuardar(): void {
    const nombreLimpio = this.nombre.trim();
    if (!nombreLimpio) return;

    const horasRes = this.tipo === 'hoja' ? this.horasResolucionCalculadas : undefined;
    const tiempoRes = this.tipo === 'hoja' ? (Number(this.tiempoResolucion) || 24) : undefined;
    const unidadRes = this.tipo === 'hoja' ? this.unidadResolucion : undefined;

    this.guardar.emit({
      nombre: nombreLimpio,
      tipo: this.tipo,
      impacto: this.tipo === 'hoja' ? this.impacto : undefined,
      criticidad: this.tipo === 'hoja' ? this.impacto : undefined,
      urgencia: this.tipo === 'hoja' ? this.urgencia : undefined,
      score: this.tipo === 'hoja' ? this.score : undefined,
      prioridad: this.tipo === 'hoja' ? this.prioridad : undefined,
      tiempoResolucion: tiempoRes,
      unidadResolucion: unidadRes,
      horasResolucion: horasRes
    });
  }
}
