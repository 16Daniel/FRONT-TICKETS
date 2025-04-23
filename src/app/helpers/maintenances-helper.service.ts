import { Injectable } from '@angular/core';
import { Mantenimiento6x6AV } from '../models/mantenimiento-6x6-av.model';
import { Mantenimiento10x10 } from '../models/mantenimiento-10x10.model';

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

    /**
     * Calcula el porcenataje cubierto en el mantenimiento 10 de 10 de [Sistemas]
     * @param mantenimiento 
     * @returns 
     */
    calcularPorcentajeSys(mantenimiento: Mantenimiento10x10): number {
      let porcentaje = 0;
      mantenimiento.mantenimientoCaja ? (porcentaje += 10) : porcentaje;
      mantenimiento.mantenimientoImpresoras ? (porcentaje += 10) : porcentaje;
      mantenimiento.mantenimientoRack ? (porcentaje += 10) : porcentaje;
      mantenimiento.mantenimientoPuntosVentaTabletas
        ? (porcentaje += 10)
        : porcentaje;
      mantenimiento.mantenimientoContenidosSistemaCable
        ? (porcentaje += 10)
        : porcentaje;
      mantenimiento.mantenimientoInternet ? (porcentaje += 10) : porcentaje;
      mantenimiento.mantenimientoCCTV ? (porcentaje += 10) : porcentaje;
      mantenimiento.mantenimientoNoBrakes ? (porcentaje += 10) : porcentaje;
      mantenimiento.mantenimientoTiemposCocina ? (porcentaje += 10) : porcentaje;
      mantenimiento.mantenimientoConcentradorApps
        ? (porcentaje += 10)
        : porcentaje;
  
      return porcentaje;
    }
}
