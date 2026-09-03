import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../interfaces/categoria.mdoel';
import { Subcategoria } from '../../interfaces/subcategoria.model';
import { ResultadoFormularioNodo } from '../../interfaces/resultado-formulario-nodo.interface';
import { EventoSeleccionMatriz } from '../../interfaces/evento-seleccion-matriz.interface';
import { SelectorMatrizCriticidadComponent } from '../selector-matriz-criticidad/selector-matriz-criticidad.component';

@Component({
  selector: 'app-formulario-nodo-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectorMatrizCriticidadComponent],
  templateUrl: './formulario-nodo-categoria.component.html',
  styleUrl: './formulario-nodo-categoria.component.scss'
})
export class FormularioNodoCategoriaComponent implements OnInit {
  @Input() modo: 'crear-raiz' | 'crear-hijo' | 'editar' = 'crear-raiz';
  @Input() nombrePadre?: string = '';
  @Input() nombreArea?: string = '';
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

  ngOnInit(): void {
    if (this.modo === 'editar' && this.nodoEditar) {
      this.nombre = this.nodoEditar.nombre || '';
      this.tipo = this.nodoEditar.tipo || 'rama';
      this.urgencia = this.nodoEditar.urgencia || 2;
      this.score = this.nodoEditar.score || 4;
      this.prioridad = this.nodoEditar.prioridad || 'Medio';

      // Resolver impacto/criticidad (1, 2 o 3)
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
    }
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

    this.guardar.emit({
      nombre: nombreLimpio,
      tipo: this.tipo,
      impacto: this.tipo === 'hoja' ? this.impacto : undefined,
      criticidad: this.tipo === 'hoja' ? this.impacto : undefined,
      urgencia: this.tipo === 'hoja' ? this.urgencia : undefined,
      score: this.tipo === 'hoja' ? this.score : undefined,
      prioridad: this.tipo === 'hoja' ? this.prioridad : undefined
    });
  }
}
