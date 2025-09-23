import { Observable } from "rxjs";

export interface IMantenimientoService {
    create(idSucursal: string, idUsuario: string, fecha: Date): Promise<void>;
    calcularPorcentaje(mantenimiento: any): number;
    obtenerMantenimientoVisitaPorFechaArea(fecha: Date, idSucursal: string, estatus?: boolean): Promise<any>;
    obtenerMantenimientoVisitaPorFecha(fecha: Date, estatus?: boolean): Promise<any>;
    getUltimosMantenimientos(idsSucursales: string[]): Observable<any[]>;
    delete(idMantenimiento: string): Promise<void>;
    update(id: string, mantenimiento: any): Promise<void>;
    getById(id: string): Observable<any | undefined>;
    obtenerMantenimientosEntreFechas(
        fechaInicio: Date,
        fechaFin: Date
    ): Promise<any[]>;
    updateLastCommentRead(
        idMantenimiento: string,
        idUsuario: string,
        ultimoComentarioLeido: number
    ): Promise<void>;
}