import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  MATRIZ_FILAS,
  MATRIZ_COLUMNAS,
  calcularScore,
  clasificarCuadrante,
  obtenerTiempoSla
} from '../../helpers/matriz-criticidad.helper';
import { CuadranteInfo } from '../../interfaces/cuadrante-info.interface';
import { EventoSeleccionMatriz } from '../../interfaces/evento-seleccion-matriz.interface';

@Component({
  selector: 'app-selector-matriz-criticidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-matriz-criticidad.component.html',
  styleUrl: './selector-matriz-criticidad.component.scss'
})
export class SelectorMatrizCriticidadComponent {
  @Input() impacto: number = 2;
  @Input() urgencia: number = 2;

  @Output() cambioSeleccion = new EventEmitter<EventoSeleccionMatriz>();

  readonly MATRIZ_FILAS = MATRIZ_FILAS;
  readonly MATRIZ_COLUMNAS = MATRIZ_COLUMNAS;
  readonly calcularScore = calcularScore;
  readonly clasificarCuadrante = clasificarCuadrante;
  readonly obtenerTiempoSla = obtenerTiempoSla;

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

  get scoreActual(): number {
    return calcularScore(this.impacto, this.urgencia);
  }

  get cuadranteActual(): CuadranteInfo {
    return clasificarCuadrante(this.scoreActual);
  }

  get tiempoSlaActual(): { horas: number; label: string } {
    return obtenerTiempoSla(this.impacto, this.urgencia);
  }
}
