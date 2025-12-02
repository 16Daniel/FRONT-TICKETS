import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Tarea } from '../../../models/tarea.model';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CategoriasTareasService } from '../../../services/categorias-tareas.service';
import { CategoriaTarea } from '../../../models/categoria-tarea.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent implements OnInit {

  @Input() tarea!: Tarea;
  @Output() seleccionarTarea = new EventEmitter<Tarea>();
  categorias: CategoriaTarea[] = [];

  constructor(private categoriasService: CategoriasTareasService) { }

  ngOnInit(): void {
    this.categoriasService.categorias$
      .subscribe(categorias => this.categorias = categorias);
  }

  onClick() {
    this.seleccionarTarea.emit(this.tarea);
  }

  getCategoriaNombre(idCategoria: string | number): string {
    const cat = this.categorias.find(c => c.id === idCategoria);
    return cat ? cat.nombre : 'Sin categoría';
  }
}
