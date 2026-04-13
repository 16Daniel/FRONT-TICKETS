export interface BatchResponse {
    message: string;
    lote: string;
    cantidad: number;
    rango: {
        inicio: string;
        fin: string;
    };
    fecha?: string;
}