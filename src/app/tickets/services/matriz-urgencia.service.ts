import { Injectable } from '@angular/core';
import {
  doc,
  Firestore,
  onSnapshot,
  setDoc,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { MatrizUrgencia } from '../interfaces/matriz-urgencia.interface';
import { CeldaMatrizUrgencia } from '../interfaces/celda-matriz-urgencia.interface';
import { clasificarCuadrante } from '../helpers/matriz-criticidad.helper';

@Injectable({
  providedIn: 'root'
})
export class MatrizUrgenciaService {
  private readonly nombreColeccion = 'cat_matriz_urgencia';

  constructor(private firestore: Firestore) {}

  /**
   * Genera la matriz predeterminada de 9 celdas con los tiempos SLA base del diseño:
   * [ 2 d ]  [ 12 h ]  [ 2 h ]
   * [ 4 d ]  [ 1 d ]   [ 8 h ]
   * [ 5 d ]  [ 3 d ]   [ 1.5 d ]
   */
  obtenerMatrizPredeterminada(idArea: string, nombreArea: string = ''): MatrizUrgencia {
    const celdasBase: CeldaMatrizUrgencia[] = [
      // Fila Impacto 3 (Crítico)
      { impacto: 3, urgencia: 1, valor: 2, unidad: 'd', horas: 48, label: '2 d', score: 3, prioridad: 'Medio' },
      { impacto: 3, urgencia: 2, valor: 12, unidad: 'h', horas: 12, label: '12 h', score: 6, prioridad: 'Alto' },
      { impacto: 3, urgencia: 3, valor: 2, unidad: 'h', horas: 2, label: '2 h', score: 9, prioridad: 'Crítico' },

      // Fila Impacto 2 (Moderado)
      { impacto: 2, urgencia: 1, valor: 4, unidad: 'd', horas: 96, label: '4 d', score: 2, prioridad: 'Bajo' },
      { impacto: 2, urgencia: 2, valor: 1, unidad: 'd', horas: 24, label: '1 d', score: 4, prioridad: 'Medio' },
      { impacto: 2, urgencia: 3, valor: 8, unidad: 'h', horas: 8, label: '8 h', score: 6, prioridad: 'Alto' },

      // Fila Impacto 1 (Leve)
      { impacto: 1, urgencia: 1, valor: 5, unidad: 'd', horas: 120, label: '5 d', score: 1, prioridad: 'Bajo' },
      { impacto: 1, urgencia: 2, valor: 3, unidad: 'd', horas: 72, label: '3 d', score: 2, prioridad: 'Bajo' },
      { impacto: 1, urgencia: 3, valor: 1.5, unidad: 'd', horas: 36, label: '1.5 d', score: 3, prioridad: 'Medio' }
    ];

    return {
      idArea: String(idArea),
      nombreArea,
      celdas: celdasBase
    };
  }

  /**
   * Obtiene y escucha en tiempo real la matriz de urgencia de un área en Firestore.
   * Si aún no existe configuración personalizada, emite de inmediato la predeterminada.
   */
  obtenerMatrizPorArea(idArea: string, nombreArea: string = ''): Observable<MatrizUrgencia> {
    if (!idArea) {
      return of(this.obtenerMatrizPredeterminada('1', nombreArea));
    }

    return new Observable<MatrizUrgencia>((observer) => {
      const documentoRef = doc(this.firestore, `${this.nombreColeccion}/${String(idArea)}`);

      const unsubscribe = onSnapshot(
        documentoRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            observer.next(this.obtenerMatrizPredeterminada(idArea, nombreArea));
            return;
          }

          const data = snapshot.data() as MatrizUrgencia;
          if (!data || !data.celdas || data.celdas.length === 0) {
            observer.next(this.obtenerMatrizPredeterminada(idArea, nombreArea || data?.nombreArea));
            return;
          }

          // Asegurar que las 9 celdas existan, completando con valores por defecto si faltase alguna
          const matrizDefecto = this.obtenerMatrizPredeterminada(idArea, nombreArea || data.nombreArea);
          const celdasCompletas = matrizDefecto.celdas.map((celdaDefecto) => {
            const encontrada = data.celdas.find(
              (c) => c.impacto === celdaDefecto.impacto && c.urgencia === celdaDefecto.urgencia
            );
            return encontrada || celdaDefecto;
          });

          observer.next({
            ...data,
            idArea: String(idArea),
            nombreArea: nombreArea || data.nombreArea || '',
            celdas: celdasCompletas
          });
        },
        (error) => {
          console.error('Error al escuchar matriz de urgencia:', error);
          observer.next(this.obtenerMatrizPredeterminada(idArea, nombreArea));
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * Guarda o actualiza la configuración de la matriz de urgencia de un área en Firestore.
   */
  async guardarMatrizPorArea(matriz: MatrizUrgencia): Promise<void> {
    const idAreaLimpio = String(matriz.idArea);
    const documentoRef = doc(this.firestore, `${this.nombreColeccion}/${idAreaLimpio}`);

    // Normalizar celdas antes de persistir
    const celdasNormalizadas: CeldaMatrizUrgencia[] = matriz.celdas.map((c) => {
      const horas = c.unidad === 'd' ? Math.round(c.valor * 24 * 10) / 10 : c.valor;
      const score = c.impacto * c.urgencia;
      const prioridad = clasificarCuadrante(score).label as any;
      const label = `${c.valor} ${c.unidad}`;

      return {
        impacto: c.impacto,
        urgencia: c.urgencia,
        valor: c.valor,
        unidad: c.unidad,
        horas,
        label,
        score,
        prioridad
      };
    });

    const payload: MatrizUrgencia = {
      idArea: idAreaLimpio,
      nombreArea: matriz.nombreArea || '',
      celdas: celdasNormalizadas,
      actualizadoEn: Timestamp.now()
    };

    await setDoc(documentoRef, payload, { merge: true });
  }

  /**
   * Encuentra la celda correspondiente para un par (impacto, urgencia) dentro de una matriz.
   */
  obtenerCelda(matriz: MatrizUrgencia | null | undefined, impacto: number, urgencia: number): CeldaMatrizUrgencia {
    const imp = Math.min(3, Math.max(1, impacto || 2));
    const urg = Math.min(3, Math.max(1, urgencia || 2));

    if (matriz && matriz.celdas && matriz.celdas.length > 0) {
      const celda = matriz.celdas.find((c) => c.impacto === imp && c.urgencia === urg);
      if (celda) return celda;
    }

    const predeterminada = this.obtenerMatrizPredeterminada(matriz?.idArea || '1');
    return predeterminada.celdas.find((c) => c.impacto === imp && c.urgencia === urg)!;
  }
}
