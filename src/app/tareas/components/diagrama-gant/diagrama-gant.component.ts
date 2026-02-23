import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarea } from '../../interfaces/tarea.interface';

interface GanttTask {
  tarea: Tarea;
  startOffset: number;
  durationDays: number;
}

@Component({
  selector: 'app-diagrama-gant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagrama-gant.component.html',
  styleUrl: './diagrama-gant.component.scss'
})
export class DiagramaGantComponent {
  // Configuración ajustable
  readonly CELL_WIDTH = 40;

  // Usamos un signal para la entrada
  private _tareas = signal<Tarea[]>([]);
  @Input() set tareas(val: Tarea[]) { this._tareas.set(val); }

  // Computamos el rango de fechas
  private dateRange = computed(() => {
    const tasks = this._tareas();
    if (tasks.length === 0) return { min: new Date(), max: new Date() };

    const starts = tasks.map(t => new Date(t.fecha).getTime());
    const ends = tasks.map(t => {
      const d = t.fechaFin || t.deathline || t.fecha;
      return new Date(d).getTime();
    });

    return {
      min: new Date(Math.min(...starts)),
      max: new Date(Math.max(...ends))
    };
  });

  // Generamos el timeline reactivamente
  timeline = computed(() => {
    const days: Date[] = [];
    const { min, max } = this.dateRange();
    let current = new Date(min);

    // Añadimos un par de días de margen visual
    while (current <= max) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  });

  // Mapeo de tareas procesadas
  ganttTasks = computed(() => {
    const minDate = this.dateRange().min;
    return this._tareas().map(t => {
      const start = new Date(t.fecha);
      const end = new Date(t.fechaFin || t.deathline || t.fecha);

      const startOffset = Math.floor((start.getTime() - minDate.getTime()) / 86400000);
      const durationDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);

      return { tarea: t, startOffset, durationDays };
    });
  });

  getBarColor(porcentaje: number = 0): string {
    if (porcentaje >= 100) return '#10b981'; // Success emerald
    if (porcentaje > 50) return '#3b82f6';  // Primary blue
    if (porcentaje > 0) return '#f59e0b';   // Warning amber
    return '#94a3b8';                       // Slate 400
  }
}
