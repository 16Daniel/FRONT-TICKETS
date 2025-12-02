import { Component, Input, type OnInit } from '@angular/core';
import { Tarea } from '../../../models/tarea.model';
import { CategoriaTarea } from '../../../models/categoria-tarea.model';
import { CategoriasTareasService } from '../../../services/categorias-tareas.service';
import { TaskDetailComponent } from "../../../modals/tasks/task-detail/task-detail.component";
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { StatusTaskService } from '../../../services/status-task.service';
import { EstatusTarea } from '../../../models/estatus-tarea.model';

@Component({
  selector: 'app-task-eisenhower-card',
  standalone: true,
  imports: [CommonModule, TaskDetailComponent, DragDropModule, ProgressBarModule,TagModule],
  templateUrl: './task-eisenhower-card.html',
  styleUrl: './task-eisenhower-card.scss',
})
export class TaskEisenhowerCard implements OnInit {
 @Input() tarea!: Tarea;
  mostrarModalDetalleTarea = false;
  categorias: CategoriaTarea[] = [];
  @Input() catEstatusTareas: EstatusTarea[] = []; 

  ngOnInit(): void {
    
  }

  onClick() {
    console.log('Tarea seleccionada:', this.tarea);
    this.mostrarModalDetalleTarea = true;
  }

  getCategoriaNombre(idCategoria: string | number): string {
    const cat = this.categorias.find(c => c.id === idCategoria);
    return cat ? cat.nombre : 'Sin categoría';
  }

  obtenerNombreEstatus(idEstatusTarea:string):string
  { 
    let nombre = this.catEstatusTareas.filter(x=> x.id == idEstatusTarea).length >0 ? this.catEstatusTareas.filter(x=> x.id == idEstatusTarea)[0].nombre : '';  
    return nombre;  
  }
}
