import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AvatarModule } from 'ngx-avatars';

import { TareasService } from '../../services/tareas.service';
import { Tarea } from '../../interfaces/tarea.interface';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { StatusTaskService } from '../../services/status-task.service';
import { AvataresResponsablesTareaComponent } from '../../components/avatares-responsables-tarea/avatares-responsables-tarea.component';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';

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
    AvatarModule,
    AvataresResponsablesTareaComponent,
    SelectButtonModule
  ],
  templateUrl: './busqueda-tareas-dialog.component.html',
  styleUrls: ['./busqueda-tareas-dialog.component.scss']
})
export class BusquedaTareasDialogComponent {
  @Input() mostrarModal: boolean = false;
  @Input() responsables: ResponsableTarea[] = [];
  @Output() closeEvent = new EventEmitter<void>();
  @Output() seleccionarTarea = new EventEmitter<Tarea>();

  terminoBusqueda: string = '';
  resultados: any[] = [];
  buscando: boolean = false;
  idEstatusFiltro: string | null = null;
  opcionesEstatus: any[] = [];

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
      const results = await this.tareasService.buscarTareasPorCoincidencia(this.terminoBusqueda);
      
      this.resultados = results.sort((a, b) => {
        const fechaA = a.fecha instanceof Date ? a.fecha : (a.fecha as any)?.toDate?.() || new Date(0);
        const fechaB = b.fecha instanceof Date ? b.fecha : (b.fecha as any)?.toDate?.() || new Date(0);
        return fechaB.getTime() - fechaA.getTime();
      });
    } catch (error) {
      console.error('Error al buscar tareas:', error);
    } finally {
      this.buscando = false;
      this.prepararFiltrosEstatus();
      this.cdr.detectChanges();
    }
  }

  prepararFiltrosEstatus() {
    const estatusEnResultados = new Set(this.resultados.map(r => r.idEstatus));
    this.opcionesEstatus = [{ label: 'TODOS', value: null }];

    this.statusService.estatus.forEach(s => {
      if (estatusEnResultados.has(s.id)) {
        this.opcionesEstatus.push({ label: s.nombre.toUpperCase(), value: s.id });
      }
    });

    if (this.resultados.some(r => !this.statusService.estatus.find(s => s.id === r.idEstatus))) {
      this.opcionesEstatus.push({ label: 'ARCHIVADOS', value: 'unknown' });
    }
  }

  get resultadosFiltrados() {
    if (!this.idEstatusFiltro) return this.resultados;
    
    return this.resultados.filter(r => {
      if (this.idEstatusFiltro === 'unknown') {
        return !this.statusService.estatus.find(s => s.id === r.idEstatus);
      }
      return r.idEstatus === this.idEstatusFiltro;
    });
  }

  onEnter(event: any) {
    this.buscar();
  }

  abrirTarea(tarea: Tarea) {
    this.seleccionarTarea.emit(tarea);
    // this.cerrarModal();
  }

  getEstatusNombre(id: string): string {
    const estatus = this.statusService.estatus.find(s => s.id === id);
    if (estatus) return estatus.nombre;
    return 'Archivado';
  }

  getEstatusClass(id: string): string {
    const estatus = this.statusService.estatus.find(s => s.id === id);
    return estatus ? `estatus-${id}` : 'estatus-5';
  }

  getBadgeClass(id: string): string {
    const estatus = this.statusService.estatus.find(s => s.id === id);
    return estatus ? `badge-estatus-${id}` : 'badge-estatus-5';
  }
}
