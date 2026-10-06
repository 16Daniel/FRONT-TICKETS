import { Injectable } from '@angular/core';
import { Ticket } from '../../tickets/interfaces/ticket.model';
import { MatrizUrgencia } from '../interfaces/matriz-urgencia.interface';
import { RadarStats } from '../interfaces/radar-stats.interface';
import { MatrizUrgenciaService } from './matriz-urgencia.service';
import { DatesHelperService } from '../../shared/helpers/dates-helper.service';

@Injectable({
  providedIn: 'root'
})
export class UmbralRadarService {
  constructor(
    private matrizUrgenciaService: MatrizUrgenciaService,
    private datesHelper: DatesHelperService
  ) {}

  private emptyStats(): RadarStats {
    return {
      totalTickets: 0,
      totalTerminados: 0,
      slaAtencionMet: 0,
      slaResolucionMet: 0,
      sumCalifSucursal: 0,
      countCalifSucursal: 0,
      sumCalifAnalista: 0,
      countCalifAnalista: 0
    };
  }

  public procesarDatosRadar(
    tickets: Ticket[],
    matriz: MatrizUrgencia | undefined,
    sucursales: any[]
  ) {
    const statsGeneral: RadarStats = this.emptyStats();
    const statsCategorias: { [name: string]: RadarStats } = {};
    const statsSucursales: { [name: string]: RadarStats } = {};

    tickets.forEach(t => {
      const catName = t.nombreSubcategoria || t.nombreCategoria || 'Sin Categoría';
      
      let sName = 'Sin Sucursal';
      if (t.idSucursal) {
        const sId = String(t.idSucursal);
        const foundS = sucursales.find(x => String(x.id) === sId);
        sName = foundS ? foundS.nombre : `Sucursal ${sId}`;
      }

      // ===== CALCULO DE SLAs =====
      const fechaCreacion = this.extraerFecha(t.fecha) || new Date();
      const fechaAtencion = this.extraerFecha(t.fechaAtencion);
      const fechaFin = this.extraerFecha(t.fechaFin) || (t.idEstatusTicket === '3' ? new Date() : null);

      // SLA Atención
      const impacto = Math.min(3, Math.max(1, t.criticidad || 2));
      const urgencia = Math.min(3, Math.max(1, t.urgencia || 2));
      const celda = this.matrizUrgenciaService.obtenerCelda(matriz, impacto, urgencia);
      const horasUrgenciaSla = celda?.horas ?? 24;

      let metSlaAtencion = false;
      if (fechaAtencion) {
        const horasTranscurridas = (fechaAtencion.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60);
        metSlaAtencion = horasTranscurridas <= horasUrgenciaSla;
      }

      // SLA Resolución
      let horasResolucionSla = 24;
      if (t.horasResolucion) {
        horasResolucionSla = t.horasResolucion;
      } else if (t.tiempoResolucion) {
        const u = t.unidadResolucion || 'h';
        horasResolucionSla = u === 'm' ? t.tiempoResolucion / 60 : (u === 'd' ? t.tiempoResolucion * 24 : t.tiempoResolucion);
      } else {
        horasResolucionSla = horasUrgenciaSla || 24;
      }

      let metSlaResolucion = false;
      if (fechaFin && fechaAtencion) {
        const horasTranscurridas = (fechaFin.getTime() - fechaAtencion.getTime()) / (1000 * 60 * 60);
        metSlaResolucion = horasTranscurridas <= horasResolucionSla;
      }

      // Calificaciones
      const calSuc = Number(t.calificacionSucursal) || 0;
      const calAna = Number(t.calificacionAnalista) || 0;

      // Verifica si el ticket está terminado (estatus 7)
      const isTerminado = String(t.idEstatusTicket) === '7';

      const addStats = (stats: RadarStats) => {
        stats.totalTickets++;
        if (isTerminado) {
          stats.totalTerminados++;
          if (metSlaAtencion) stats.slaAtencionMet++;
          if (metSlaResolucion) stats.slaResolucionMet++;
        }
        if (calSuc > 0) { stats.sumCalifSucursal += calSuc; stats.countCalifSucursal++; }
        if (calAna > 0) { stats.sumCalifAnalista += calAna; stats.countCalifAnalista++; }
      };

      if (!statsCategorias[catName]) statsCategorias[catName] = this.emptyStats();
      if (!statsSucursales[sName]) statsSucursales[sName] = this.emptyStats();

      addStats(statsGeneral);
      addStats(statsCategorias[catName]);
      addStats(statsSucursales[sName]);
    });

    // NORMALIZACIÓN
    const maxTicketsCategoria = Math.max(...Object.values(statsCategorias).map(s => s.totalTickets), 1);
    const maxTicketsSucursal = Math.max(...Object.values(statsSucursales).map(s => s.totalTickets), 1);

    const radarDataGeneral = this.formatRadarSeries('General', statsGeneral, statsGeneral.totalTickets);
    const radarDataCategorias: { [name: string]: any[] } = {};
    const radarDataSucursales: { [name: string]: any[] } = {};

    Object.keys(statsCategorias).forEach(cName => {
      radarDataCategorias[cName] = this.formatRadarSeries(cName, statsCategorias[cName], maxTicketsCategoria);
    });
    
    Object.keys(statsSucursales).forEach(sName => {
      radarDataSucursales[sName] = this.formatRadarSeries(sName, statsSucursales[sName], maxTicketsSucursal);
    });

    return {
      radarDataGeneral,
      radarDataCategorias,
      radarDataSucursales
    };
  }

  private formatRadarSeries(name: string, stats: RadarStats, maxTickets: number): any[] {
    const ptTickets = maxTickets > 0 ? (stats.totalTickets / maxTickets) * 100 : 0;
    const ptTerminados = stats.totalTickets > 0 ? (stats.totalTerminados / stats.totalTickets) * 100 : 0;
    const ptSlaAtencion = stats.totalTerminados > 0 ? (stats.slaAtencionMet / stats.totalTerminados) * 100 : 0;
    const ptSlaResolucion = stats.totalTerminados > 0 ? (stats.slaResolucionMet / stats.totalTerminados) * 100 : 0;
    
    const ptCalifSuc = stats.countCalifSucursal > 0 ? (stats.sumCalifSucursal / stats.countCalifSucursal / 5) * 100 : 0;
    const ptCalifAna = stats.countCalifAnalista > 0 ? (stats.sumCalifAnalista / stats.countCalifAnalista / 5) * 100 : 0;

    return [
      {
        name: name,
        series: [
          { name: 'Volumen Relativo', value: Math.round(ptTickets) },
          { name: 'T. Terminados', value: Math.round(ptTerminados) },
          { name: 'SLA Atención', value: Math.round(ptSlaAtencion) },
          { name: 'SLA Resolución', value: Math.round(ptSlaResolucion) },
          { name: 'Calif. Sucursal', value: Math.round(ptCalifSuc) },
          { name: 'Calif. Analista', value: Math.round(ptCalifAna) }
        ]
      }
    ];
  }

  private extraerFecha(fechaRaw: any): Date | null {
    if (!fechaRaw) return null;
    try {
      if (fechaRaw.toDate && typeof fechaRaw.toDate === 'function') {
        return fechaRaw.toDate();
      }
      return this.datesHelper.getDate(fechaRaw);
    } catch {
      return null;
    }
  }
}
