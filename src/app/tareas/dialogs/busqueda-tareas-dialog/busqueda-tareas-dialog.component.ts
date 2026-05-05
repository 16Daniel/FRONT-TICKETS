import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { AvatarModule } from 'ngx-avatars';

import { TareasService } from '../../services/tareas.service';
import { Tarea } from '../../interfaces/tarea.interface';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { StatusTaskService } from '../../services/status-task.service';

@Component({
  selector: 'app-busqueda-tareas-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ListboxModule,
    AvatarModule
  ],
  templateUrl: './busqueda-tareas-dialog.component.html',
  styleUrls: ['./busqueda-tareas-dialog.component.scss']
})
export class BusquedaTareasDialogComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() seleccionarTarea = new EventEmitter<Tarea>();

  terminoBusqueda: string = '';
  resultados: any[] = [];
  buscando: boolean = false;

  tareasService = inject(TareasService);
  cdr = inject(ChangeDetectorRef);
  datesHelper = inject(DatesHelperService);
  statusService = inject(StatusTaskService);

  cerrarModal() {
    this.closeEvent.emit();
    this.terminoBusqueda = '';
    this.resultados = [];
  }

  async buscar() {
    if (!this.terminoBusqueda || this.terminoBusqueda.trim().length === 0) {
      this.resultados = [];
      return;
    }

    this.buscando = true;
    try {
      this.resultados = await this.tareasService.buscarTareasPorCoincidencia(this.terminoBusqueda);
      console.log(this.resultados);
    } catch (error) {
      console.error('Error al buscar tareas:', error);
    } finally {
      this.buscando = false;
      this.cdr.detectChanges();
    }
  }

  onEnter(event: any) {
    this.buscar();
  }

  abrirTarea(tarea: Tarea) {
    this.seleccionarTarea.emit(tarea);
    // this.cerrarModal();
  }

  getEstatusNombre(id: string): string {
    return this.statusService.estatus.find(s => s.id === id)?.nombre || 'Desconocido';
  }
}
