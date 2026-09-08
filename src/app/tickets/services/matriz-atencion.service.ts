import { Injectable } from '@angular/core';
import {
  doc,
  Firestore,
  onSnapshot,
  setDoc,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, of, shareReplay } from 'rxjs';
import { MatrizAtencion } from '../interfaces/matriz-atencion.interface';
import { CeldaMatrizAtencion } from '../interfaces/celda-matriz-atencion.interface';
import { clasificarCuadrante } from '../helpers/matriz-criticidad.helper';

@Injectable({
  providedIn: 'root'
})
export class MatrizAtencionService {
  private readonly nombreColeccion = 'cat_matriz_atencion';
  private cacheObservables = new Map<string, Observable<MatrizAtencion>>();

  constructor(private firestore: Firestore) {}

  /**
   * Genera la matriz de atención predeterminada 3×3 con los tiempos SLA base:
   * [ 2 d ]  [ 12 h ]  [ 2 h ]
   * [ 4 d ]  [ 1 d ]   [ 8 h ]
   * [ 5 d ]  [ 3 d ]   [ 1.5 d ]
   */
  obtenerMatrizPredeterminada(idArea: string, nombreArea: string = ''): MatrizAtencion {
    const celdasBase: CeldaMatrizAtencion[] = [
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
   * Obtiene y escucha en tiempo real la configuración de la matriz de atención (3×3) de un área.
   */
  obtenerMatrizPorArea(idArea: string, nombreArea: string = ''): Observable<MatrizAtencion> {
    const areaKey = String(idArea || '1');
    if (this.cacheObservables.has(areaKey)) {
      return this.cacheObservables.get(areaKey)!;
    }

    const obs$ = new Observable<MatrizAtencion>((observer) => {
      const documentoRef = doc(this.firestore, `${this.nombreColeccion}/${areaKey}`);

      const unsubscribe = onSnapshot(
        documentoRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            observer.next(this.obtenerMatrizPredeterminada(areaKey, nombreArea));
            return;
          }

          const data = snapshot.data() as MatrizAtencion;
          if (!data || !data.celdas || data.celdas.length === 0) {
            observer.next(this.obtenerMatrizPredeterminada(areaKey, nombreArea || data?.nombreArea));
            return;
          }

          // Completar con valores predeterminados si faltase alguna celda o viniera en formato legacy
          const defecto = this.obtenerMatrizPredeterminada(areaKey, nombreArea || data.nombreArea);
          const celdasCompletas = defecto.celdas.map((cDef) => {
            const encontrada = data.celdas.find(
              (c) => c.impacto === cDef.impacto && c.urgencia === cDef.urgencia
            );
            return encontrada || cDef;
          });

          observer.next({
            ...data,
            idArea: areaKey,
            nombreArea: nombreArea || data.nombreArea || '',
            celdas: celdasCompletas
          });
        },
        (error) => {
          console.error('Error al escuchar matriz de atención:', error);
          observer.next(this.obtenerMatrizPredeterminada(areaKey, nombreArea));
        }
      );

      return () => unsubscribe();
    }).pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.cacheObservables.set(areaKey, obs$);
    return obs$;
  }

  /**
   * Guarda o actualiza la matriz de atención de un área en Firestore.
   */
  async guardarMatrizPorArea(matriz: MatrizAtencion): Promise<void> {
    const idAreaLimpio = String(matriz.idArea);
    const documentoRef = doc(this.firestore, `${this.nombreColeccion}/${idAreaLimpio}`);

    const celdasNormalizadas: CeldaMatrizAtencion[] = matriz.celdas.map((c) => {
      const horas = c.unidad === 'd' ? Math.round(c.valor * 24 * 10) / 10 : c.valor;
      const score = (c.impacto || 2) * (c.urgencia || 2);
      const prioridad = (c.prioridad || clasificarCuadrante(score).label) as any;
      return {
        impacto: c.impacto || 2,
        urgencia: c.urgencia || 2,
        score,
        prioridad,
        valor: c.valor,
        unidad: c.unidad,
        horas,
        label: `${c.valor} ${c.unidad}`
      };
    });

    const payload: MatrizAtencion = {
      idArea: idAreaLimpio,
      nombreArea: matriz.nombreArea || '',
      celdas: celdasNormalizadas,
      actualizadoEn: Timestamp.now()
    };

    await setDoc(documentoRef, payload, { merge: true });
  }

  /**
   * Encuentra la celda correspondiente para un par (impacto, urgencia) dentro de una matriz de atención.
   */
  obtenerCelda(matriz: MatrizAtencion | null | undefined, impacto: number, urgencia: number): CeldaMatrizAtencion {
    const imp = Math.min(3, Math.max(1, impacto || 2));
    const urg = Math.min(3, Math.max(1, urgencia || 2));

    if (matriz && matriz.celdas && matriz.celdas.length > 0) {
      const celda = matriz.celdas.find((c) => c.impacto === imp && c.urgencia === urg);
      if (celda) return celda;
    }

    const predeterminada = this.obtenerMatrizPredeterminada(matriz?.idArea || '1');
    return predeterminada.celdas.find((c) => c.impacto === imp && c.urgencia === urg)!;
  }

  /**
   * Obtiene la celda correspondiente para un nivel de prioridad dado (compatibilidad legacy).
   */
  obtenerCeldaPorPrioridad(
    matriz: MatrizAtencion | null | undefined,
    prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo'
  ): CeldaMatrizAtencion {
    if (matriz && matriz.celdas && matriz.celdas.length > 0) {
      const encontrada = matriz.celdas.find((c) => c.prioridad === prioridad);
      if (encontrada) return encontrada;
    }
    const defecto = this.obtenerMatrizPredeterminada(matriz?.idArea || '1');
    return defecto.celdas.find((c) => c.prioridad === prioridad) || defecto.celdas[0];
  }
}
