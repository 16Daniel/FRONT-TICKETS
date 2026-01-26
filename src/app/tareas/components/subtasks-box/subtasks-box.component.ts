import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { DropdownModule } from 'primeng/dropdown';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { AvatarModule } from 'ngx-avatars';
import { Tarea } from '../../interfaces/tarea.interface';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-subtasks-box',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, AvatarModule, TooltipModule],

  templateUrl: './subtasks-box.component.html',
  styleUrl: './subtasks-box.component.scss'
})
export class SubtasksBoxComponent implements OnInit {

  @Input() tarea: any;
  @Input() mostrarSubtareas: boolean = false;

  @Output() subtareaAgregada = new EventEmitter<string>();

  resposablesService = inject(TaskResponsibleService);

  nuevaSubtarea: string = '';
  responsables: ResponsableTarea[] = [];

  ngOnInit(): void {
    this.resposablesService.responsables$
      .subscribe(responsables => this.filtrarResponsables(responsables));
  }

  private filtrarResponsables(responsables: any[]) {
    this.responsables = responsables.filter(r =>
      this.tarea?.idsResponsables?.includes(r.id)
    );
  }

  agregarSubtarea() {
    if (!this.nuevaSubtarea.trim()) return;

    this.subtareaAgregada.emit(this.nuevaSubtarea);
    this.nuevaSubtarea = '';
  }

  eliminarSubtarea(index: number) {
    this.tarea.subtareas.splice(index, 1);
  }

  calcularProgreso(): number {
    if (!this.tarea.subtareas || this.tarea.subtareas.length === 0) return 0;

    const total = this.tarea.subtareas.length;
    const terminadas = this.tarea.subtareas.filter((s: any) => s.terminado).length;

    return Math.round((terminadas / total) * 100);
  }

  getProgressColor(): string {
    const porcentaje = this.calcularProgreso();

    if (porcentaje <= 30) return 'bg-danger';
    if (porcentaje <= 70) return 'bg-warning';

    return 'bg-success';
  }

  onResponsableSubtareaChange() {
    // this.guardarCambiosSubtareas();
  }

  getResponsablesDeTarea(idResponsable: string) {
    return this.responsables.find(r => r.id == idResponsable);
  }

}
