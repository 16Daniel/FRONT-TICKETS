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
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { MatrizAtencion } from '../../interfaces/matriz-atencion.interface';
import { CeldaMatrizAtencion } from '../../interfaces/celda-matriz-atencion.interface';
import { MatrizAtencionService } from '../../services/matriz-atencion.service';
import {
  MATRIZ_FILAS,
  MATRIZ_COLUMNAS,
  clasificarCuadrante
} from '../../helpers/matriz-criticidad.helper';

@Component({
  selector: 'app-configuracion-matriz-atencion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-matriz-atencion.component.html',
  styleUrl: './configuracion-matriz-atencion.component.scss'
})
export class ConfiguracionMatrizAtencionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() idArea: string = '1';
  @Input() nombreArea: string = '';

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<MatrizAtencion>();

  readonly MATRIZ_FILAS = MATRIZ_FILAS;
  readonly MATRIZ_COLUMNAS = MATRIZ_COLUMNAS;
  readonly clasificarCuadrante = clasificarCuadrante;

  matrizEditable!: MatrizAtencion;
  celdaSeleccionada: CeldaMatrizAtencion | null = null;
  cargando: boolean = false;
  guardando: boolean = false;

  readonly presetsRapidos: Array<{ valor: number; unidad: 'h' | 'd'; label: string }> = [
    { valor: 2, unidad: 'h', label: '2 h' },
    { valor: 4, unidad: 'h', label: '4 h' },
    { valor: 8, unidad: 'h', label: '8 h' },
    { valor: 12, unidad: 'h', label: '12 h' },
    { valor: 1, unidad: 'd', label: '1 d (24h)' },
    { valor: 1.5, unidad: 'd', label: '1.5 d (36h)' },
    { valor: 2, unidad: 'd', label: '2 d (48h)' },
    { valor: 3, unidad: 'd', label: '3 d (72h)' },
    { valor: 4, unidad: 'd', label: '4 d (96h)' },
    { valor: 5, unidad: 'd', label: '5 d (120h)' }
  ];

  private subscripcionMatriz?: Subscription;

  constructor(
    private matrizAtencionService: MatrizAtencionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMatrizArea();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idArea'] && !changes['idArea'].firstChange) {
      this.cargarMatrizArea();
    }
  }

  ngOnDestroy(): void {
    this.subscripcionMatriz?.unsubscribe();
  }

  cargarMatrizArea(): void {
    this.matrizEditable = this.matrizAtencionService.obtenerMatrizPredeterminada(
      this.idArea,
      this.nombreArea
    );
    this.celdaSeleccionada = this.obtenerCelda(3, 3);
    this.cargando = false;
    this.cdr.detectChanges();

    this.subscripcionMatriz?.unsubscribe();
    this.subscripcionMatriz = this.matrizAtencionService
      .obtenerMatrizPorArea(this.idArea, this.nombreArea)
      .subscribe({
        next: (matriz) => {
          if (matriz && matriz.celdas && matriz.celdas.length > 0) {
            this.matrizEditable = JSON.parse(JSON.stringify(matriz));
          }
          this.cargando = false;

          if (!this.celdaSeleccionada) {
            this.celdaSeleccionada = this.obtenerCelda(3, 3);
          } else {
            this.celdaSeleccionada = this.obtenerCelda(
              this.celdaSeleccionada.impacto,
              this.celdaSeleccionada.urgencia
            );
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar la matriz de atención:', err);
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  obtenerCelda(impacto: number, urgencia: number): CeldaMatrizAtencion {
    if (!this.matrizEditable || !this.matrizEditable.celdas) {
      const def = this.matrizAtencionService.obtenerMatrizPredeterminada(this.idArea, this.nombreArea);
      return def.celdas.find((c) => c.impacto === impacto && c.urgencia === urgencia)!;
    }
    const celda = this.matrizEditable.celdas.find(
      (c) => c.impacto === impacto && c.urgencia === urgencia
    );
    return celda || this.matrizAtencionService.obtenerCelda(this.matrizEditable, impacto, urgencia);
  }

  seleccionarCelda(impacto: number, urgencia: number): void {
    this.celdaSeleccionada = this.obtenerCelda(impacto, urgencia);
  }

  aplicarPreset(preset: { valor: number; unidad: 'h' | 'd' }): void {
    if (!this.celdaSeleccionada) return;
    this.celdaSeleccionada.valor = preset.valor;
    this.celdaSeleccionada.unidad = preset.unidad;
    this.alCambiarTiempoCelda();
  }

  alCambiarTiempoCelda(): void {
    if (!this.celdaSeleccionada) return;

    const valorNum = parseFloat(String(this.celdaSeleccionada.valor));
    if (isNaN(valorNum) || valorNum <= 0) {
      return;
    }

    this.celdaSeleccionada.valor = valorNum;
    this.celdaSeleccionada.horas =
      this.celdaSeleccionada.unidad === 'd'
        ? Math.round(valorNum * 24 * 10) / 10
        : valorNum;
    this.celdaSeleccionada.label = `${valorNum} ${this.celdaSeleccionada.unidad}`;
    this.cdr.detectChanges();
  }

  cambiarUnidad(unidad: 'h' | 'd'): void {
    if (!this.celdaSeleccionada || this.celdaSeleccionada.unidad === unidad) return;

    if (unidad === 'd') {
      const dias = Math.round((this.celdaSeleccionada.valor / 24) * 10) / 10;
      this.celdaSeleccionada.valor = dias > 0 ? dias : 1;
    } else {
      const horas = Math.round(this.celdaSeleccionada.valor * 24);
      this.celdaSeleccionada.valor = horas > 0 ? horas : 1;
    }

    this.celdaSeleccionada.unidad = unidad;
    this.alCambiarTiempoCelda();
  }

  restablecerValoresPredeterminados(): void {
    Swal.fire({
      title: '¿Restablecer matriz a valores base?',
      text: 'Se cargarán los tiempos predeterminados de atención (2d, 12h, 2h, 4d, 1d, 8h, 5d, 3d, 1.5d).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, restablecer',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ea580c'
    }).then((res) => {
      if (res.isConfirmed) {
        this.matrizEditable = this.matrizAtencionService.obtenerMatrizPredeterminada(
          this.idArea,
          this.nombreArea
        );
        if (this.celdaSeleccionada) {
          this.celdaSeleccionada = this.obtenerCelda(
            this.celdaSeleccionada.impacto,
            this.celdaSeleccionada.urgencia
          );
        }
        this.cdr.detectChanges();
      }
    });
  }

  async guardarCambios(): Promise<void> {
    if (!this.matrizEditable) return;

    this.guardando = true;
    this.cdr.detectChanges();
    try {
      this.matrizEditable.idArea = String(this.idArea);
      this.matrizEditable.nombreArea = this.nombreArea;

      await this.matrizAtencionService.guardarMatrizPorArea(this.matrizEditable);

      Swal.fire({
        title: '¡Matriz de Atención Guardada!',
        text: `Los tiempos de atención para el área "${this.nombreArea}" han sido actualizados en Firebase.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      this.guardado.emit(this.matrizEditable);
    } catch (err: any) {
      console.error('Error al guardar la matriz de atención:', err);
      Swal.fire({
        title: 'Error al guardar',
        text: err.message || 'No fue posible guardar la matriz de atención.',
        icon: 'error'
      });
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }
}
