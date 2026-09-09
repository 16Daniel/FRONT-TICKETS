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
import { EventoSeleccionMatriz } from '../../interfaces/evento-seleccion-matriz.interface';
import { MatrizUrgencia } from '../../interfaces/matriz-urgencia.interface';
import { MatrizUrgenciaService } from '../../services/matriz-urgencia.service';

@Component({
  selector: 'app-selector-matriz-criticidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-matriz-criticidad.component.html',
  styleUrl: './selector-matriz-criticidad.component.scss'
})
export class SelectorMatrizCriticidadComponent implements OnInit, OnChanges, OnDestroy {
  @Input() impacto: number = 2;
  @Input() urgencia: number = 2;
  @Input() idArea?: string;
  @Input() matrizUrgencia?: MatrizUrgencia | null;

  @Output() cambioSeleccion = new EventEmitter<EventoSeleccionMatriz>();

  readonly MATRIZ_FILAS = MATRIZ_FILAS;
  readonly MATRIZ_COLUMNAS = MATRIZ_COLUMNAS;
  readonly calcularScore = calcularScore;
  readonly clasificarCuadrante = clasificarCuadrante;

  private subscripcionMatriz?: Subscription;

  constructor(
    private matrizUrgenciaService: MatrizUrgenciaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sincronizarMatriz();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['matrizUrgencia']) {
      this.subscripcionMatriz?.unsubscribe();
      this.cdr.detectChanges();
    } else if (changes['idArea'] && !this.matrizUrgencia) {
      this.sincronizarMatriz();
    }
  }

  ngOnDestroy(): void {
    this.subscripcionMatriz?.unsubscribe();
  }

  private sincronizarMatriz(): void {
    if (this.matrizUrgencia) return;

    if (this.idArea) {
      this.subscripcionMatriz?.unsubscribe();
      this.subscripcionMatriz = this.matrizUrgenciaService
        .obtenerMatrizPorArea(this.idArea)
        .subscribe((m) => {
          this.matrizUrgencia = m;
          this.cdr.detectChanges();
        });
    }
  }

  seleccionar(imp: number, urg: number): void {
    this.impacto = imp;
    this.urgencia = urg;
    const score = calcularScore(imp, urg);
    const cuadrante = clasificarCuadrante(score);
    this.cambioSeleccion.emit({
      impacto: imp,
      urgencia: urg,
      score: score,
      prioridad: cuadrante.label
    });
  }

  obtenerTiempoSlaCelda(imp: number, urg: number): { horas: number; label: string } {
    const celda = this.matrizUrgenciaService.obtenerCelda(this.matrizUrgencia, imp, urg);
    if (celda) {
      return { horas: celda.horas, label: celda.label };
    }
    return obtenerTiempoSla(imp, urg);
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
