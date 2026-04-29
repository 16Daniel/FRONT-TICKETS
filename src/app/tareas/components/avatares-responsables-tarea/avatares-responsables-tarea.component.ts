import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarea } from '../../interfaces/tarea.interface';
import { AvatarComponent } from "ngx-avatars";
import { TooltipModule } from 'primeng/tooltip';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatares-responsables-tarea',
  standalone: true,
  imports: [AvatarComponent, TooltipModule, CommonModule],
  templateUrl: './avatares-responsables-tarea.component.html',
  styleUrl: './avatares-responsables-tarea.component.scss'
})
export class AvataresResponsablesTareaComponent {
  @Input() tarea: Tarea = new Tarea;
  @Input() responsables: ResponsableTarea[] = [];
  @Input() mostrarCorona: boolean = false;
  @Output() responsableLiderEvent = new EventEmitter<ResponsableTarea>();

  onSeleccionarLider(responsable: ResponsableTarea) {
    this.responsableLiderEvent.emit(responsable);
  }

  getResponsablesDeTarea(tarea: Tarea) {
    return this.responsables.filter(r =>
      tarea.idsResponsables?.includes(r.id!)
    );
  }

  getProgresoResponsable(idResponsable: string): { mostrar: boolean, porcentaje: number } {
    if (!this.tarea.subtareas || this.tarea.subtareas.length === 0) {
      return { mostrar: false, porcentaje: 0 };
    }

    const subtareasDelResponsable = this.tarea.subtareas.filter(st => st.idResponsable === idResponsable);

    if (subtareasDelResponsable.length === 0) {
      return { mostrar: false, porcentaje: 0 };
    }

    const terminadas = subtareasDelResponsable.filter(st => st.terminado).length;
    const porcentaje = Math.round((terminadas / subtareasDelResponsable.length) * 100);

    return { mostrar: true, porcentaje };
  }
}
