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
    prioridad?: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';

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

