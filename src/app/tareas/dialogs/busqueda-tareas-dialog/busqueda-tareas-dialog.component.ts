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
  opcionesEstatus: any[] = [
    { label: 'TODOS', value: null },
    { label: 'TO DO', value: '1' },
    { label: 'WORKING', value: '2' },
    { label: 'CHEK', value: '3' },
    { label: 'DONE', value: '4' },
    { label: 'TO FILE', value: '5' },
    { label: 'DESCONOCIDO', value: 'unknown' },
  ];

  tareasService = inject(TareasService);
  cdr = inject(ChangeDetectorRef);
  datesHelper = inject(DatesHelperService);

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
      this.cdr.detectChanges();
    }
  }

  get resultadosFiltrados() {
    if (!this.idEstatusFiltro) return this.resultados;

    if (this.idEstatusFiltro === 'unknown') {
      const idsValidos = ['1', '2', '3', '4', '5'];
      return this.resultados.filter(r => !idsValidos.includes(r.idEstatus));
    }

    return this.resultados.filter(r => r.idEstatus === this.idEstatusFiltro);
  }

  onEnter(event: any) {
    this.buscar();
  }

  abrirTarea(tarea: Tarea) {
    this.seleccionarTarea.emit(tarea);
    // this.cerrarModal();
  }

  getEstatusNombre(id: string): string {
    const nombres: any = {
      '1': 'TO DO',
      '2': 'WORKING',
      '3': 'CHEK',
      '4': 'DONE',
      '5': 'TO FILE'
    };
    return nombres[id] || 'DESCONOCIDO';
  }

  getEstatusClass(id: string): string {
    const idsValidos = ['1', '2', '3', '4'];
    return idsValidos.includes(id) ? `estatus-${id}` : 'estatus-5';
  }

  getBadgeClass(id: string): string {
    const idsValidos = ['1', '2', '3', '4'];
    return idsValidos.includes(id) ? `badge-estatus-${id}` : 'badge-estatus-5';
  }
}
