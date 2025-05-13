import { Mantenimiento10x10 } from "./mantenimiento-10x10.model";
import { Sucursal } from "./sucursal.model";
import { Ticket } from "./ticket.model";

export interface SucursalProgramada extends Sucursal {
    idsTickets: String[];
    ticketsFinalizados?: Ticket[];
    fechaVisita?: Date;
    mantenimientosDelDia?: any[];
}
