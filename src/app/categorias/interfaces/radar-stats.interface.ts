export interface RadarStats {
  totalTickets: number;
  totalTerminados: number;
  totalMitigacion?: number;
  slaAtencionMet: number;
  slaResolucionMet: number;
  sumCalifSucursal: number;
  countCalifSucursal: number;
  sumCalifAnalista: number;
  countCalifAnalista: number;
  detalles: any[];
}
