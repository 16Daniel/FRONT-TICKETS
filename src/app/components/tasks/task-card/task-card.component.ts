import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Tarea } from '../../../models/tarea.model';
import { CommonModule } from '@angular/common';
import { TaskDetailComponent } from '../../../modals/tasks/task-detail/task-detail.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CategoriasTareasService } from '../../../services/categorias-tareas.service';
import { CategoriaTarea } from '../../../models/categoria-tarea.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, TaskDetailComponent, DragDropModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent implements OnInit {
  @Input() tarea!: Tarea;
  mostrarModalDetalleTarea = false;
  categorias: CategoriaTarea[] = [];

  constructor(private categoriasService: CategoriasTareasService) { }

  ngOnInit(): void {
    this.categoriasService.categorias$.subscribe(categorias => this.categorias = categorias);
  }

  onClick() {
    console.log('Tarea seleccionada:', this.tarea);
    this.mostrarModalDetalleTarea = true;
  }

  getCategoriaNombre(idCategoria: string | number): string {
    const cat = this.categorias.find(c => c.id === idCategoria);
    return cat ? cat.nombre : 'Sin categoría';
  }
}
