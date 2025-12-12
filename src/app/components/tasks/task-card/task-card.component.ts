import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';

import { TareasService } from '../../../services/tareas.service';
import { Tarea } from '../../../models/tarea.model';
import { EtiquetaTarea } from '../../../models/etiqueta-tarea.model';
import { LabelsTasksService } from '../../../services/labels-tasks.service';

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
  etiquetas: EtiquetaTarea[] = [];

  constructor(
    private tareasService: TareasService,
    private messageService: MessageService,
    private labelsTasksService: LabelsTasksService
  ) { }

  ngOnInit(): void {
    this.labelsTasksService.etiquetas$.subscribe(et => {
      this.etiquetas = et;
    });
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

  getProgressColor(porcentaje: number) {
    if (porcentaje < 40) return 'bg-danger';
    if (porcentaje < 70) return 'bg-warning';
    return 'bg-success';
  }

  getEtiquetaColor(id: string) {
    const et = this.etiquetas.find(e => e.id === id);
    return et ? et.color : '#ccc';
  }

  getEtiquetaNombre(id: string) {
    const et = this.etiquetas.find(e => e.id === id);
    return et ? et.nombre : '';
  }

}
