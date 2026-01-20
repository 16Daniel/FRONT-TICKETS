export class MantenimientoActivoFijo {
    id?: string;
    costo: number | null = null;
    detalle: string = '';
    fecha: Date = new Date;
    folioTicket: string = '';
    eliminado: boolean = false;
}