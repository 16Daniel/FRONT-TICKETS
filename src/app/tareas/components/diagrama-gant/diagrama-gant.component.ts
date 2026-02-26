import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarea } from '../../interfaces/tarea.interface';
import { StatusTaskService } from '../../services/status-task.service';
import { TooltipModule } from 'primeng/tooltip';

interface GanttTask {
  tarea: Tarea;
  startOffset: number;
  durationDays: number;
}

@Component({
  selector: 'app-diagrama-gant',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './diagrama-gant.component.html',
  styleUrl: './diagrama-gant.component.scss'
})
export class DiagramaGantComponent implements OnInit {
  @Input() set tareas(val: Tarea[]) { this._tareas.set(val); }
  @Input() estatusMap = new Map<string, string>();

  @Input()
  set mostrarProyectos(val: boolean) {
    this._mostrarProyectos = val;

    // Esperamos a que Angular renderice
    setTimeout(() => {
      this.scrollToToday();
    });
  }

  private _mostrarProyectos = false;

  @Output() seleccionarTarea = new EventEmitter<Tarea>();

  @ViewChild('scrollContainer')
  scrollContainer!: ElementRef<HTMLDivElement>;

  estatusService = inject(StatusTaskService);
  cdr = inject(ChangeDetectorRef);

  readonly CELL_WIDTH = 40;
  private _tareas = signal<Tarea[]>([]);

  // Se obtiene el rango de fechas
  private dateRange = computed(() => {
    const tasks = this._tareas();

    if (tasks.length === 0) {
      const now = new Date();
      return { min: now, max: now };
    }

    const starts = tasks.map(t =>
      this.getDateFromTask(t, true).getTime()
    );

    const ends = tasks.map(t =>
      this.getDateFromTask(t, false).getTime()
    );

    const minDate = new Date(Math.min(...starts));
    const maxDate = new Date(Math.max(...ends));

    // console.log('Fecha inicio calculada:', minDate.toLocaleDateString());
    // console.log('Fecha fin calculada:', maxDate.toLocaleDateString());

    return {
      min: minDate,
      max: maxDate
    };
  });

  // Se genera el timeline
  timeline = computed(() => {
    const days: Date[] = [];
    const { min, max } = this.dateRange();

    let current = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    const end = new Date(max.getFullYear(), max.getMonth(), max.getDate());

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  });

  // Mapeo de tareas procesadas
  ganttTasks = computed(() => {
    const minDateRaw = this.dateRange().min;

    const minDate = new Date(
      minDateRaw.getFullYear(),
      minDateRaw.getMonth(),
      minDateRaw.getDate()
    );

    return this._tareas().map(t => {

      const startRaw = this.getDateFromTask({ fecha: t.fecha }, true);
      const endRaw = this.getDateFromTask(t, false);

      const start = new Date(
        startRaw.getFullYear(),
        startRaw.getMonth(),
        startRaw.getDate()
      );

      const end = new Date(
        endRaw.getFullYear(),
        endRaw.getMonth(),
        endRaw.getDate()
      );

      const startOffset =
        Math.floor((start.getTime() - minDate.getTime()) / 86400000);

      const durationDays =
        Math.max(
          1,
          Math.floor((end.getTime() - start.getTime()) / 86400000) + 1
        );

      const result: GanttTask = { tarea: t, startOffset, durationDays };
      return result;
    });
  });

  ngOnInit(): void {
    this.estatusService.estatus$.subscribe(estatus => {
      this.estatusMap.clear();
      estatus.forEach(x => this.estatusMap.set(x.id!, x.nombre));
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToToday();
    });
  }

  private scrollToToday(): void {
    const days = this.timeline();
    const todayIndex = days.findIndex(d => this.isToday(d));

    if (todayIndex === -1) return;

    const scrollPosition = todayIndex * this.CELL_WIDTH;

    this.scrollContainer.nativeElement.scrollTo({
      left: scrollPosition - 20, // pequeño margen
      behavior: 'smooth' // puedes usar 'smooth' si quieres animación
    });
  }

  getBarColor(porcentaje: number = 0): string {
    if (porcentaje < 40) return '#DC3545';
    if (porcentaje < 70) return '#FFC107';
    return '#198754';
  }

  private getDateFromTask(task: any, initDate: boolean): Date {

    // 🔥 Solo usar deathline cuando NO es fecha inicial
    if (!initDate && task?.deathline) {
      // Siempre viene formato YYYY-MM-DD
      const [year, month, day] = task.deathline.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    const value = task?.fecha;

    if (!value) return new Date();

    if (value instanceof Date) return value;

    if (value?.toDate && typeof value.toDate === 'function') {
      return value.toDate();
    }

    if (typeof value === 'string') {
      return new Date(value);
    }

    if (typeof value === 'number') {
      return new Date(value);
    }

    return new Date(value);
  }

  onClick(tarea: Tarea) {
    console.log(tarea)
    this.seleccionarTarea.emit(tarea);
  }

  isToday(date: Date): boolean {
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  contadorTareas = computed(() => this._tareas().length);
}
