import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../interfaces/categoria.mdoel';
import { Subcategoria } from '../../interfaces/subcategoria.model';
import { ResultadoFormularioNodo } from '../../interfaces/resultado-formulario-nodo.interface';
import { EventoSeleccionMatriz } from '../../interfaces/evento-seleccion-matriz.interface';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { MatrizResolucion } from '../../interfaces/matriz-resolucion.interface';
import { SelectorMatrizCriticidadComponent } from '../selector-matriz-criticidad/selector-matriz-criticidad.component';
import { SelectorMatrizResolucionComponent } from '../selector-matriz-resolucion/selector-matriz-resolucion.component';

@Component({
  selector: 'app-formulario-nodo-categoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectorMatrizCriticidadComponent,
    SelectorMatrizResolucionComponent
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
  @Input() matrizResolucion?: MatrizResolucion | null = null;
  // Compatibilidad legacy input
  @Input() set matrizAtencion(val: MatrizResolucion | null | undefined) {
    if (val !== undefined) this.matrizResolucion = val;
  }
  get matrizAtencion(): MatrizResolucion | null | undefined {
    return this.matrizResolucion;
  }

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

  criticidadResolucion: number = 2;
  urgenciaResolucion: number = 2;
  scoreResolucion: number = 4;
  prioridadResolucion: 'Crítico' | 'Alto' | 'Medio' | 'Bajo' = 'Medio';

  // Compatibilidad legacy properties
  get criticidadAtencion(): number { return this.criticidadResolucion; }
  set criticidadAtencion(v: number) { this.criticidadResolucion = v; }
  get urgenciaAtencion(): number { return this.urgenciaResolucion; }
  set urgenciaAtencion(v: number) { this.urgenciaResolucion = v; }
  get scoreAtencion(): number { return this.scoreResolucion; }
  set scoreAtencion(v: number) { this.scoreResolucion = v; }
  get prioridadAtencion(): 'Crítico' | 'Alto' | 'Medio' | 'Bajo' { return this.prioridadResolucion; }
  set prioridadAtencion(v: 'Crítico' | 'Alto' | 'Medio' | 'Bajo') { this.prioridadResolucion = v; }

  ngOnInit(): void {
    if (this.modo === 'editar' && this.nodoEditar) {
      this.nombre = this.nodoEditar.nombre || '';
      this.tipo = this.nodoEditar.tipo || 'rama';
      this.urgencia = this.nodoEditar.urgenciaUrgencia || this.nodoEditar.urgencia || 2;
      this.score = this.nodoEditar.scoreUrgencia || this.nodoEditar.score || 4;
      this.prioridad = this.nodoEditar.prioridadUrgencia || (this.nodoEditar as any).prioridad || 'Medio';

      // Resolver impacto/criticidad de urgencia (1, 2 o 3)
      let imp = this.nodoEditar.criticidadUrgencia || (this.nodoEditar as any).impacto || this.nodoEditar.criticidad;
      if (!imp || imp > 3) {
        if (this.nodoEditar.score && this.nodoEditar.urgencia) {
          imp = Math.round(this.nodoEditar.score / this.nodoEditar.urgencia);
        } else if (this.nodoEditar.prioridadUrgencia || (this.nodoEditar as any).prioridad) {
          const p = (this.nodoEditar.prioridadUrgencia || (this.nodoEditar as any).prioridad).toUpperCase();
          imp = p.includes('CRÍT') || p.includes('CRIT') ? 3 : p.includes('ALT') ? 3 : p.includes('MED') ? 2 : 1;
        } else {
          imp = 2;
        }
      }
      this.impacto = Math.min(3, Math.max(1, imp || 2));

      // Resolver coordenadas de resolución (3×3)
      this.criticidadResolucion = this.nodoEditar.criticidadResolucion || this.nodoEditar.criticidadAtencion || this.impacto;
      this.urgenciaResolucion = this.nodoEditar.urgenciaResolucion || this.nodoEditar.urgenciaAtencion || this.urgencia;
      this.scoreResolucion = this.nodoEditar.scoreResolucion || this.nodoEditar.scoreAtencion || (this.criticidadResolucion * this.urgenciaResolucion);
      this.prioridadResolucion = (this.nodoEditar as any).prioridadResolucion || (this.nodoEditar as any).prioridadAtencion || (this.prioridad as any) || 'Medio';
    } else if (this.modo === 'crear-hijo') {
      this.tipo = 'hoja';
    }
  }

  alCambiarMatriz(evento: EventoSeleccionMatriz): void {
    this.impacto = evento.impacto;
    this.urgencia = evento.urgencia;
    this.score = evento.score;
    this.prioridad = evento.prioridad;
  }

  alCambiarMatrizResolucion(evento: {
    impacto: number;
    urgencia: number;
    score: number;
    prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
    tiempo: string;
    horas: number;
  }): void {
    this.criticidadResolucion = evento.impacto;
    this.urgenciaResolucion = evento.urgencia;
    this.scoreResolucion = evento.score;
    this.prioridadResolucion = evento.prioridad;
  }

  // Compatibilidad legacy
  alCambiarMatrizAtencion(evento: any): void {
    this.alCambiarMatrizResolucion(evento);
  }

  alGuardar(): void {
    const nombreLimpio = this.nombre.trim();
    if (!nombreLimpio) return;

    const scoreGlobal = (this.score || 4) + (this.scoreResolucion || 4);

    this.guardar.emit({
      nombre: nombreLimpio,
      tipo: this.tipo,
      impacto: this.tipo === 'hoja' ? this.impacto : undefined,
      criticidad: this.tipo === 'hoja' ? this.impacto : undefined,
      urgencia: this.tipo === 'hoja' ? this.urgencia : undefined,
      score: this.tipo === 'hoja' ? this.score : undefined,
      prioridad: this.tipo === 'hoja' ? this.prioridad : undefined,

      // Urgencia (3×3)
      criticidadUrgencia: this.tipo === 'hoja' ? this.impacto : undefined,
      urgenciaUrgencia: this.tipo === 'hoja' ? this.urgencia : undefined,
      scoreUrgencia: this.tipo === 'hoja' ? this.score : undefined,
      prioridadUrgencia: this.tipo === 'hoja' ? (this.prioridad as any) : undefined,

      // Resolución (3×3)
      criticidadResolucion: this.tipo === 'hoja' ? this.criticidadResolucion : undefined,
      urgenciaResolucion: this.tipo === 'hoja' ? this.urgenciaResolucion : undefined,
      scoreResolucion: this.tipo === 'hoja' ? this.scoreResolucion : undefined,
      prioridadResolucion: this.tipo === 'hoja' ? this.prioridadResolucion : undefined,

      // Atención (3×3) [Compatibilidad]
      criticidadAtencion: this.tipo === 'hoja' ? this.criticidadResolucion : undefined,
      urgenciaAtencion: this.tipo === 'hoja' ? this.urgenciaResolucion : undefined,
      scoreAtencion: this.tipo === 'hoja' ? this.scoreResolucion : undefined,
      prioridadAtencion: this.tipo === 'hoja' ? this.prioridadResolucion : undefined,

      // Global
      scoreGlobal: this.tipo === 'hoja' ? scoreGlobal : undefined
    });
  }
}
