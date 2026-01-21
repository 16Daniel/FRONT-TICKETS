import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'ngx-avatars';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { TareasService } from '../../services/tareas.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { SearchFilterPipe } from '../../../shared/pipes/search-filter.pipe';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { Tarea } from '../../interfaces/tarea.model';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.model';

@Component({
  selector: 'app-modal-archived-tasks',
  standalone: true,
  imports: [FormsModule, DialogModule, CalendarModule, DropdownModule, CommonModule, AvatarModule, TooltipModule, SearchFilterPipe],
  templateUrl: './modal-archived-tasks.component.html',
  styleUrl: './modal-archived-tasks.component.scss'
})
export class ModalArchivedTasksComponent implements OnInit {

  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  fechaInicio: Date = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  })();
  fechaFin: Date = new Date();
  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  idSucursalSeleccionada: string = '';
  usuario: Usuario;
  tareas: Tarea[] = [];
  responsables: ResponsableTarea[] = [];
  textoBusqueda?: string;

  branchesService = inject(BranchesService);
  tasksService = inject(TareasService);
  public datesHelper = inject(DatesHelperService);
  cdr = inject(ChangeDetectorRef);
  taskResponsibleService = inject(TaskResponsibleService);

  constructor() {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursalSeleccionada = this.usuario.sucursales[0].id;
  }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.buscarTickets();

    this.taskResponsibleService.responsables$.subscribe(responsable => this.responsables = responsable);
  }

  onHide = () => this.closeEvent.emit(false);

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;

        this.sucursalesMap.clear();
        data.forEach(s =>
          this.sucursalesMap.set(s.id!, s.nombre)
        );

        this.cdr.detectChanges();
      }
    });
  }

  buscarTickets() {
    this.tasksService
      .getArchivedTasks(this.idSucursalSeleccionada, this.fechaInicio, this.fechaFin)
      .subscribe(tasks => {
        this.tareas = tasks;
        // console.log(this.tareas)
        this.cdr.detectChanges();
      });
  }

  getResponsablesDeTarea(tarea: Tarea) {
    return this.responsables.filter(r =>
      tarea.idsResponsables?.includes(r.id!)
    );
  }

  async onClickDesarchivar(tarea: Tarea) {
    const result = await Swal.fire({
      title: '¿Desarchivar tarea?',
      text: 'La tarea volverá a la lista activa.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, desarchivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      customClass: {
        container: 'swal-topmost'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await this.tasksService.update(
        { ...tarea, idEstatus: '4' },
        tarea.id!
      );

      await Swal.fire({
        icon: 'success',
        title: 'Tarea desarchivada',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          container: 'swal-topmost'
        }
      });

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo desarchivar la tarea',
        customClass: {
          container: 'swal-topmost'
        }
      });
    }
  }

  onBuscarTitulo() {

  }

}
