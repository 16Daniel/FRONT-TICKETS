import { Sucursal } from "../../sucursales/interfaces/sucursal.model";
import { Ticket } from "../../tickets/models/ticket.model";


export interface SucursalProgramada extends Sucursal {
    idsTickets: String[];
    ticketsFinalizados?: Ticket[];
    fechaVisita?: Date;
    mantenimientosDelDia?: any[];
}
