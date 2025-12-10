import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';

import { TareasService } from '../../../services/tareas.service';
import { Tarea } from '../../../models/tarea.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  providers: [MessageService],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent implements OnInit {

  @Input() tarea!: Tarea;
  @Output() seleccionarTarea = new EventEmitter<Tarea>();

  constructor(
    private tareasService: TareasService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
  }

  onClick() {
    this.seleccionarTarea.emit(this.tarea);
  }

  async archivarTarea(tarea: Tarea) {
    const result = await Swal.fire({
      title: '¿Archivar tarea?',
      text: 'Esta tarea pasará al estatus ARCHIVADO.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, archivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    try {
      tarea.idEstatus = '5';
      await this.tareasService.update(tarea, tarea.id!);
      this.showMessage('success', 'Success', 'Archivado correctamente');
    } catch (error) {
      this.showMessage('error', 'Error', 'No se pudo archivar la tarea');
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async eliminarTarea(tarea: Tarea) {
    const result = await Swal.fire({
      title: '¿Eliminar tarea?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    });

    if (!result.isConfirmed) return;

    tarea.eliminado = true;
    try {
      await this.tareasService.update(tarea, tarea.id!);
      this.showMessage('success', 'Eliminada', 'La tarea fue eliminada correctamente');
    } catch (error) {
      this.showMessage('error', 'Error', 'No se pudo eliminar la tarea');
    }
  }

}
