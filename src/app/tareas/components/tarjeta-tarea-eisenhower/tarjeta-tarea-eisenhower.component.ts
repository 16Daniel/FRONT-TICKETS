import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';

import { Tarea } from '../../interfaces/tarea.interface';
import { EstatusTarea } from '../../interfaces/estatus-tarea.interface';

@Component({
  selector: 'app-tarjeta-tarea-eisenhower',
  standalone: true,
  imports: [CommonModule, DragDropModule, ProgressBarModule, TagModule],
  templateUrl: './tarjeta-tarea-eisenhower.component.html',
  styleUrl: './tarjeta-tarea-eisenhower.component.scss',
})
export class TarjetaTareaEisenhowerComponent {
  @Input() tarea!: Tarea;
  @Output() seleccionarTarea = new EventEmitter<Tarea>();
  categorias: any[] = [];
  @Input() catEstatusTareas: EstatusTarea[] = [];

  onClick() {
    this.seleccionarTarea.emit(this.tarea);
  }

  getCategoriaNombre(idCategoria: string | number): string {
    const cat = this.categorias.find(c => c.id === idCategoria);
    return cat ? cat.nombre : 'Sin categoría';
  }

  obtenerNombreEstatus(idEstatusTarea: string): string {
    let nombre = this.catEstatusTareas.filter(x => x.id == idEstatusTarea).length > 0 ? this.catEstatusTareas.filter(x => x.id == idEstatusTarea)[0].nombre : '';
    return nombre;
  }
}
