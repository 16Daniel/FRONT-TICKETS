export interface MensajePendiente {
    id?: string;
    idOrigen: string; // ID del ticket, mantenimiento, etc.
    tipoOrigen: 'Tickets' | '10x10' | '8x8' | '6x6' | 'Compras' | 'Pagos'; // tipo de chat
    idComentario: string;
    idUsuarioDestino: string;
    idUsuarioRemitente: string;
    nombreRemitente: string;
    //   mensaje: string;
    timestamp: any;
    leido: boolean;
}
