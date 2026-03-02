import { Sucursal } from "../../sucursales/interfaces/sucursal.interface";
import { Ticket } from "../../tickets/interfaces/ticket.model";

export interface SucursalProgramada extends Sucursal {
  idsTickets: String[];
  ticketsFinalizados?: Ticket[];
  fechaVisita?: Date;
  mantenimientosDelDia?: any[];
}
