import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatrizAtencion } from '../../interfaces/matriz-atencion.interface';
import { CeldaMatrizAtencion } from '../../interfaces/celda-matriz-atencion.interface';
import { MatrizAtencionService } from '../../services/matriz-atencion.service';

interface InfoCuadrante2x2 {
  prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
  bg: string;
  text: string;
  icon: string;
}

@Component({
  selector: 'app-selector-matriz-atencion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-matriz-atencion.component.html',
  styleUrl: './selector-matriz-atencion.component.scss'
})
export class SelectorMatrizAtencionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() prioridadSeleccionada: 'Crítico' | 'Alto' | 'Medio' | 'Bajo' = 'Medio';
  @Input() idArea?: string;
  @Input() matrizAtencion?: MatrizAtencion | null;

  @Output() cambioSeleccion = new EventEmitter<{
    prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
    tiempo: string;
    horas: number;
  }>();

  readonly cuadrantes2x2: InfoCuadrante2x2[] = [
    { prioridad: 'Crítico', bg: '#FFF1F2', text: '#E11D48', icon: 'bx-flame' },
    { prioridad: 'Alto', bg: '#FFEDD5', text: '#C2410C', icon: 'bx-error-alt' },
    { prioridad: 'Bajo', bg: '#F0FDF4', text: '#059669', icon: 'bx-check-circle' },
    { prioridad: 'Medio', bg: '#FEFCE8', text: '#CA8A04', icon: 'bx-time-five' }
  ];

  private subscripcionMatriz?: Subscription;

  constructor(
    private matrizAtencionService: MatrizAtencionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sincronizarMatriz();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['matrizAtencion']) {
      this.subscripcionMatriz?.unsubscribe();
      this.cdr.detectChanges();
    } else if (changes['idArea'] && !this.matrizAtencion) {
      this.sincronizarMatriz();
    }
  }

  ngOnDestroy(): void {
    this.subscripcionMatriz?.unsubscribe();
  }

  private sincronizarMatriz(): void {
    if (this.matrizAtencion) return;

    if (this.idArea) {
      this.subscripcionMatriz?.unsubscribe();
      this.subscripcionMatriz = this.matrizAtencionService
        .obtenerMatrizPorArea(this.idArea)
        .subscribe((m) => {
          this.matrizAtencion = m;
          this.cdr.detectChanges();
        });
    }
  }

  obtenerCelda(prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo'): CeldaMatrizAtencion {
    return this.matrizAtencionService.obtenerCeldaPorPrioridad(this.matrizAtencion, prioridad);
  }

  seleccionar(prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo'): void {
    this.prioridadSeleccionada = prioridad;
    const celda = this.obtenerCelda(prioridad);
    this.cambioSeleccion.emit({
      prioridad,
      tiempo: celda.label,
      horas: celda.horas
    });
  }

  get celdaActual(): CeldaMatrizAtencion {
    return this.obtenerCelda(this.prioridadSeleccionada);
  }

  get estiloActual(): InfoCuadrante2x2 {
    return this.cuadrantes2x2.find((c) => c.prioridad === this.prioridadSeleccionada) || this.cuadrantes2x2[3];
  }
}
