export interface BatchResponse {
    message: string;
    lote: string;
    cantidad: number;
    cupon_inicial?: string;
    cupon_final?: string;
}