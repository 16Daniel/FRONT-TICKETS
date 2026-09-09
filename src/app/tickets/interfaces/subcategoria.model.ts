export class Subcategoria {
    id: string = '';
    nombre: string = '';
    eliminado: boolean = false;
    tipo?: 'rama' | 'hoja' = 'hoja';
    subcategorias?: Subcategoria[] = [];
    activarSubcategorias?: boolean = false;
    // Urgencia (3×3)
    urgencia?: number;
    criticidad?: number;
    score?: number;
    criticidadUrgencia?: number;
    urgenciaUrgencia?: number;
    scoreUrgencia?: number;
    prioridadUrgencia?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

    // Resolución (3×3)
    criticidadResolucion?: number;
    urgenciaResolucion?: number;
    scoreResolucion?: number;
    prioridadResolucion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

    // Atención (3×3) [Compatibilidad]
    criticidadAtencion?: number;
    urgenciaAtencion?: number;
    scoreAtencion?: number;
    prioridadAtencion?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

    // Score Global
    scoreGlobal?: number;

    constructor() {
        this.id = generateGUID();
        this.subcategorias = [];
    }
}

export function generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

