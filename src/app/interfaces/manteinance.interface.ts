export interface IMantenimientoService {
    create(idSucursal: string, idUsuario: string, fecha: Date): Promise<void>;
}