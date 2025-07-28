import { Pipe, PipeTransform } from '@angular/core';
import { ActivoFijo } from '../models/activo-fijo.model'; // Ajusta según tu estructura

@Pipe({
  name: 'buscarPorReferencia',
  standalone: true
})
export class BuscarPorReferenciaPipe implements PipeTransform {

  transform(activos: ActivoFijo[], texto: string): ActivoFijo[] {
    if (!activos || !texto) {
      return activos;
    }

    texto = texto.toLowerCase().trim();
    return activos.filter(activo =>
      activo.referencia?.toLowerCase().includes(texto)
    );
  }

}
