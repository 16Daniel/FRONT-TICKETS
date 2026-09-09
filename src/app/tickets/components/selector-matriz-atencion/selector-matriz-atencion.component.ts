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
import {
  MATRIZ_FILAS,
  MATRIZ_COLUMNAS,
  calcularScore,
  clasificarCuadrante,
  obtenerTiempoSla
} from '../../helpers/matriz-criticidad.helper';
import { CuadranteInfo } from '../../interfaces/cuadrante-info.interface';
import { MatrizAtencion } from '../../interfaces/matriz-atencion.interface';
import { CeldaMatrizAtencion } from '../../interfaces/celda-matriz-atencion.interface';
import { MatrizAtencionService } from '../../services/matriz-atencion.service';

@Component({
  selector: 'app-selector-matriz-atencion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-matriz-atencion.component.html',
  styleUrl: './selector-matriz-atencion.component.scss'
})
export class SelectorMatrizAtencionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() impacto: number = 2;
  @Input() urgencia: number = 2;
  @Input() idArea?: string;
  @Input() matrizAtencion?: MatrizAtencion | null;
  @Input() prioridadSeleccionada?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

  @Output() cambioSeleccion = new EventEmitter<{
    impacto: number;
    urgencia: number;
    score: number;
    prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
    tiempo: string;
    horas: number;
  }>();

  readonly MATRIZ_FILAS = MATRIZ_FILAS;
  readonly MATRIZ_COLUMNAS = MATRIZ_COLUMNAS;
  readonly calcularScore = calcularScore;
  readonly clasificarCuadrante = clasificarCuadrante;

  private subscripcionMatriz?: Subscription;

  constructor(
    private matrizAtencionService: MatrizAtencionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.prioridadSeleccionada && (!this.impacto || !this.urgencia)) {
      this.mapearPrioridadACoordenadas(this.prioridadSeleccionada);
    }
    this.sincronizarMatriz();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['matrizAtencion']) {
      this.subscripcionMatriz?.unsubscribe();
      this.cdr.detectChanges();
    } else if (changes['idArea'] && !this.matrizAtencion) {
      this.sincronizarMatriz();
    }

    if (changes['prioridadSeleccionada'] && this.prioridadSeleccionada && !changes['impacto'] && !changes['urgencia']) {
      this.mapearPrioridadACoordenadas(this.prioridadSeleccionada);
    }
  }

  ngOnDestroy(): void {
    this.subscripcionMatriz?.unsubscribe();
  }

  private mapearPrioridadACoordenadas(p: string): void {
    switch (p) {
      case 'Crítico':
        this.impacto = 3;
        this.urgencia = 3;
        break;
      case 'Alto':
        this.impacto = 2;
        this.urgencia = 3;
        break;
      case 'Medio':
        this.impacto = 2;
        this.urgencia = 2;
        break;
      case 'Bajo':
        this.impacto = 1;
        this.urgencia = 1;
        break;
    }
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

  seleccionar(imp: number, urg: number): void {
    this.impacto = imp;
    this.urgencia = urg;
    const celda = this.obtenerCelda(imp, urg);
    const score = calcularScore(imp, urg);
    const prioridad = (celda.prioridad || clasificarCuadrante(score).label) as any;
    this.prioridadSeleccionada = prioridad;

    this.cambioSeleccion.emit({
      impacto: imp,
      urgencia: urg,
      score,
      prioridad,
      tiempo: celda.label,
      horas: celda.horas
    });
  }

  obtenerCelda(imp: number, urg: number): CeldaMatrizAtencion {
    return this.matrizAtencionService.obtenerCelda(this.matrizAtencion, imp, urg);
  }

  obtenerTiempoSlaCelda(imp: number, urg: number): { horas: number; label: string } {
    const celda = this.obtenerCelda(imp, urg);
    if (celda) {
      return { horas: celda.horas, label: celda.label };
    }
    return obtenerTiempoSla(imp, urg);
  }

  get celdaActual(): CeldaMatrizAtencion {
    return this.obtenerCelda(this.impacto, this.urgencia);
  }

  get scoreActual(): number {
    return calcularScore(this.impacto, this.urgencia);
  }

  get cuadranteActual(): CuadranteInfo {
    return clasificarCuadrante(this.scoreActual);
  }

  get tiempoSlaActual(): { horas: number; label: string } {
    return this.obtenerTiempoSlaCelda(this.impacto, this.urgencia);
  }
}
