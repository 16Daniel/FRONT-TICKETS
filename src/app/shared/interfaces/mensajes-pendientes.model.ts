export interface MensajePendiente {
    id?: string;
    idOrigen: string; // ID del ticket, mantenimiento, etc.
    tipoOrigen: 'Tickets' | '10x10' | '8x8' | 'AudioVideo-8x8' | 'Compras' | 'Pagos' | 'Sistemas-8x8'; // tipo de chat
    idComentario: string;
    idUsuarioDestino: string;
    idUsuarioRemitente: string;
    nombreRemitente: string;
    //   mensaje: string;
    timestamp: any;
    leido: boolean;
}
