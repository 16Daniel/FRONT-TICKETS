import { Observable } from "rxjs";

export interface IMantenimientoService {
    create(idSucursal: string, idUsuario: string, fecha: Date): Promise<void>;
    calcularPorcentaje(mantenimiento: any): number;
    obtenerMantenimientoVisitaPorFecha(fecha: Date, idSucursal: string): Promise<any>;
    getUltimosMantenimientos(idsSucursales: string[]): Observable<any[]>
}