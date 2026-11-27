export type CampoOpcionalDispositivo =
  | 'marca'
  | 'pulgadas'
  | 'modelo'
  | 'numeroSerie'
  | 'comentarios';

export interface TipoDispositivo {
  /** Identificador único del tipo (ej. 'tv', 'bocina', 'tableta', 'tpv') */
  id: string;
  /** Nombre plural visible en el encabezado de la sección (ej. 'TVs', 'Bocinas') */
  nombre: string;
  /** Nombre singular usado en botones y formularios (ej. 'TV', 'Bocina') */
  nombreSingular: string;
  /** Clase de ícono Boxicons (ej. 'bx bx-tv') */
  icono: string;
  /** Área operativa a la que pertenece este tipo de dispositivo (ej. '2' = AV, '1' = TI) */
  idArea: string;
  /** Orden de visualización dentro del área */
  orden: number;
  /** Indica si el tipo está habilitado */
  activo: boolean;
  /** Placeholder sugerido para el campo nombre */
  placeholderNombre: string;
  /** Placeholder sugerido para la marca */
  placeholderMarca?: string;
  /** Placeholder sugerido para el modelo */
  placeholderModelo?: string;
  /** Lista de campos opcionales visibles en el formulario para este tipo */
  camposOpcionales: CampoOpcionalDispositivo[];
}
