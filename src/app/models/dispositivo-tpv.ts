export class DispositivoTPV {
    id: string = '';
    nombre: string = '';
    estatus: string = '1';
    eliminado: boolean = false;

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

