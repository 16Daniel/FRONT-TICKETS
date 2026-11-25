export class Dispositivo {
    id: string = '';
    nombre: string = '';
    estatus: string = '1';
    eliminado: boolean = false;
    marca?: string = '';
    pulgadas?: string = '';
    modelo?: string = '';
    numeroSerie?: string = '';
    comentarios?: string = '';

    constructor() {
        this.id = generateGUID();
    }
}

function generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

