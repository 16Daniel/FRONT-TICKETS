import { Injectable } from '@angular/core';
import { customAlphabet } from 'nanoid';

@Injectable({
  providedIn: 'root'
})
export class GeneradorFoliosService {
  private readonly prefijo = 'RW';
  private readonly nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPRSTUCVWXYZ', 1);

  constructor() { }

  /**
   * Genera un folio único basado en el ID de sucursal, un carácter aleatorio y un contador.
   * @param idSucursal ID de la sucursal (número entero)
   * @param count Número incremental
   * @returns Folio en formato: RW[ID_SUCURSAL][CARACTER]-[INCREMENTAL]
   */
  generarFolio(idSucursal: number, count: number): string {
    const sucursal = this.rellenarCeros(idSucursal, 2); // Formatear ID de sucursal
    const aleatorio = this.nanoid(); // Generar carácter aleatorio
    const incremental = this.rellenarCeros(count, 5); // Formatear el contador

    return `${this.prefijo}${sucursal}${aleatorio}-${incremental}`;
  }

  /**
   * Rellena un número con ceros a la izquierda hasta alcanzar la longitud especificada.
   * @param numero Número a formatear
   * @param longitud Longitud deseada del resultado
   * @returns Número formateado con ceros a la izquierda
   */
  private rellenarCeros(numero: number, longitud: number): string {
    return numero.toString().padStart(longitud, '0');
  }
}
