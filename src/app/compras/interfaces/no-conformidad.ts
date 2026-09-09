import { Timestamp } from "@angular/fire/firestore";

export interface DevolucionAla {
  id?: string;
  codigoFormato?: string; // FSUPR-0501
  
  // 1.- Información del Proveedor
  fechaReporte: Timestamp;
  proveedor: string;

  // 2.- Descripción
  lote: string;
  fechaEntrega: Timestamp;
  noFacturaRemision: string;
  cantidadEntregadaKg: number;
  cantidadRechazadaKg: number;

  // Motivos de Rechazo (Organolépticos)
  motivosRechazo: {
    color?: string;
    textura?: string;
    olor?: string;
    corte?: string;
  };

  // Fotos (3 máximo)
  fotosUrl: string[];
  createdAt?: Date;

  estatus:string;
  sucursal:string;
}