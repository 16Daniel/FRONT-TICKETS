import { Comentario } from "./comentario-chat.model";
import { Timestamp } from '@angular/fire/firestore';
import { ParticipanteChat } from "./participante-chat.model";
export interface AdministracionCompra 
{
    id?:string; 
    idUsuario: string;
    fecha:Timestamp, 
    mes:string, 
    razonsocial:string; 
    statuscompra:string;
    statuspago:string; 
    fechadepago:Timestamp|null; 
    fechaEntrega:Timestamp|null; 
    palabraclave:string; 
    articulos:ArticuloCompra[]; 
    factura:string; 
    comprobantePago:string;
    comentarios: Comentario[];
    solicitudCancelacion:boolean; 
    participantesChat: ParticipanteChat[];
    solicitante:string;
    tipoCompra:string; 
    idArea:string|null;
    metodoPago:string; 
    sucursales:string[]; 
    regiones:string[];
    validado:number; 
    idSucursalSolicitante:string|null; 
    validacionServico:boolean
 }

export interface ArticuloCompra
{
    art:string,
    uds:number,
    precio:number; 
    tipo:string; 
    link:string; 
    idprov:string|null; 
    justificacion:string; 
    nomprov:string|null; 
    idTipo:string;
    region:string, 
    idsucursal:string;
    direccionentrega:string; 
}

export interface Proveedor {
  id?: string; // Opcional porque Firestore lo genera automáticamente
  razonSocial: string;
  cuenta: string;
  cuentaInterbancaria: string;
  banco: string;
  rfc: string;
  idUsuario:string; 
  idArea:string|null; 
}
