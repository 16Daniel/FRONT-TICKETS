import { Injectable } from '@angular/core';
import { Mantenimiento6x6AV } from '../models/mantenimiento-6x6-av.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenancesHelperService {

  constructor() { }

  /**
   * Calcula el porcenataje cubierto en el mantenimiento 6 de 6 de [Audio y Video]
   * @param mantenimiento 
   * @returns 
   */
    calcularPorcentajeAV(mantenimiento: Mantenimiento6x6AV) {
      let porcentaje = 0;
      mantenimiento.mantenimientoConexiones ? (porcentaje += 16.67) : porcentaje;
      mantenimiento.mantenimientoCableado ? (porcentaje += 16.67) : porcentaje;
      mantenimiento.mantenimientoRack ? (porcentaje += 16.67) : porcentaje;
      mantenimiento.mantenimientoControles
        ? (porcentaje += 16.67)
        : porcentaje;
      mantenimiento.mantenimientoNivelAudio
        ? (porcentaje += 16.67)
        : porcentaje;
      mantenimiento.mantenimientoCanales ? (porcentaje += 16.67) : porcentaje;
  
      return Math.round(porcentaje);
    }
}
