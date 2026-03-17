import { MantenimientoActivoFijo } from "../../mantenimientos/interfaces/mantenimiento-activo-fijo.interface";

export class ActivoFijo {
    id?: string;
    descripcion: string = '';
    idSucursal: string = '';
    idArea: string = '';
    idCategoriaActivoFijo: string = '';
    idAreaActivoFijo: string = '';
    idEstatusActivoFijo: string = '';
    idUbicacionActivoFijo: string = '';
    consecutivo: number = 0;
    referencia: string = '';
    costo: number | null = null;
    esFreidora: boolean=false;
    eliminado: boolean = false;
    mantenimientos: MantenimientoActivoFijo[] = [];
    referenciasAnteriores: string[] = []
}
