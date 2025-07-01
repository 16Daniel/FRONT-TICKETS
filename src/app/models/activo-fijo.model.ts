import { MantenimientoActivoFijo } from "./mantenimiento-activo-fijo.model";

export class ActivoFijo {
    id: string | any;
    descripcion: string = '';
    idSucursal: string = '';
    idArea: string = '';
    idCategoriaActivoFijo: string = '';
    idAreaActivoFijo: string = '';
    idEstatusActivoFijo: string = '';
    idUbicacionActivoFijo: string = '';
    consecutivo: number = 0;
    referencia: string = '';
    noMantenimientos: number | null = null;
    costo: number | null = null;    
    eliminado: boolean = false;
    mantenimientos: MantenimientoActivoFijo[] = [];
}