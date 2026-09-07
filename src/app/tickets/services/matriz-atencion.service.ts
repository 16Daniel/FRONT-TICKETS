import { Injectable } from '@angular/core';
import {
  doc,
  Firestore,
  onSnapshot,
  setDoc,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { MatrizAtencion } from '../interfaces/matriz-atencion.interface';
import { CeldaMatrizAtencion } from '../interfaces/celda-matriz-atencion.interface';

@Injectable({
  providedIn: 'root'
})
export class MatrizAtencionService {
  private readonly nombreColeccion = 'cat_matriz_atencion';

  constructor(private firestore: Firestore) {}

  /**
   * Genera la matriz de atención predeterminada 2×2 con el orden exacto:
   * [ Crítico (Rojo) ]   [ Alto (Naranja) ]
   * [ Bajo (Verde) ]     [ Medio (Amarillo) ]
   */
  obtenerMatrizPredeterminada(idArea: string, nombreArea: string = ''): MatrizAtencion {
    const celdasBase: CeldaMatrizAtencion[] = [
      {
        posicion: 'arriba-izquierda',
        prioridad: 'Crítico',
        valor: 2,
        unidad: 'h',
        horas: 2,
        label: '2 h'
      },
      {
        posicion: 'arriba-derecha',
        prioridad: 'Alto',
        valor: 24,
        unidad: 'h',
        horas: 24,
        label: '24 h'
      },
      {
        posicion: 'abajo-izquierda',
        prioridad: 'Bajo',
        valor: 3,
        unidad: 'd',
        horas: 72,
        label: '3 d'
      },
      {
        posicion: 'abajo-derecha',
        prioridad: 'Medio',
        valor: 2,
        unidad: 'd',
        horas: 48,
        label: '2 d'
      }
    ];

    return {
      idArea: String(idArea),
      nombreArea,
      celdas: celdasBase
    };
  }

  /**
   * Obtiene y escucha en tiempo real la configuración de la matriz de atención (2×2) de un área.
   */
  obtenerMatrizPorArea(idArea: string, nombreArea: string = ''): Observable<MatrizAtencion> {
    if (!idArea) {
      return of(this.obtenerMatrizPredeterminada('1', nombreArea));
    }

    return new Observable<MatrizAtencion>((observer) => {
      const documentoRef = doc(this.firestore, `${this.nombreColeccion}/${String(idArea)}`);

      const unsubscribe = onSnapshot(
        documentoRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            observer.next(this.obtenerMatrizPredeterminada(idArea, nombreArea));
            return;
          }

          const data = snapshot.data() as MatrizAtencion;
          if (!data || !data.celdas || data.celdas.length === 0) {
            observer.next(this.obtenerMatrizPredeterminada(idArea, nombreArea || data?.nombreArea));
            return;
          }

          // Completar con valores predeterminados si faltase alguna de las 4 celdas
          const defecto = this.obtenerMatrizPredeterminada(idArea, nombreArea || data.nombreArea);
          const celdasCompletas = defecto.celdas.map((cDef) => {
            const encontrada = data.celdas.find((c) => c.prioridad === cDef.prioridad);
            return encontrada || cDef;
          });

          observer.next({
            ...data,
            idArea: String(idArea),
            nombreArea: nombreArea || data.nombreArea || '',
            celdas: celdasCompletas
          });
        },
        (error) => {
          console.error('Error al escuchar matriz de atención:', error);
          observer.next(this.obtenerMatrizPredeterminada(idArea, nombreArea));
        }
      );

      return () => unsubscribe();
    });
  }

  /**
   * Guarda o actualiza la matriz de atención de un área en Firestore.
   */
  async guardarMatrizPorArea(matriz: MatrizAtencion): Promise<void> {
    const idAreaLimpio = String(matriz.idArea);
    const documentoRef = doc(this.firestore, `${this.nombreColeccion}/${idAreaLimpio}`);

    const celdasNormalizadas: CeldaMatrizAtencion[] = matriz.celdas.map((c) => {
      const horas = c.unidad === 'd' ? Math.round(c.valor * 24 * 10) / 10 : c.valor;
      return {
        posicion: c.posicion,
        prioridad: c.prioridad,
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
   * Obtiene la celda correspondiente para un nivel de prioridad dado.
   */
  obtenerCeldaPorPrioridad(
    matriz: MatrizAtencion | null | undefined,
    prioridad: 'Crítico' | 'Alto' | 'Medio' | 'Bajo'
  ): CeldaMatrizAtencion {
    if (matriz && matriz.celdas) {
      const encontrada = matriz.celdas.find((c) => c.prioridad === prioridad);
      if (encontrada) return encontrada;
    }
    const defecto = this.obtenerMatrizPredeterminada(matriz?.idArea || '1');
    return defecto.celdas.find((c) => c.prioridad === prioridad)!;
  }
}
