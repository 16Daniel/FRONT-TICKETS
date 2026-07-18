export interface MensajePendiente {
    id?: string;
    idOrigen: string; // ID del ticket, mantenimiento, etc.
    tipoOrigen: 'Tickets' | 'Sistemas' | 'AudioVideo' | 'Compras' | 'Pagos'; // tipo de chat
    idComentario: string;
    idUsuarioDestino: string;
    idUsuarioRemitente: string;
    nombreRemitente: string;
    //   mensaje: string;
    timestamp: any;
    leido: boolean;
}
