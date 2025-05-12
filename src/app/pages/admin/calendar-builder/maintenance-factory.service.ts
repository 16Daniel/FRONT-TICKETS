import { Injectable } from "@angular/core";
import { Maintenance10x10Service } from "../../../services/maintenance-10x10.service";
import { Maintenance6x6AvService } from "../../../services/maintenance-6x6-av.service";
import { IMantenimientoService } from "../../../interfaces/manteinance.interface";

@Injectable({ providedIn: 'root' })
export class MantenimientoFactoryService {
  constructor(
    private mantenimientoSys: Maintenance10x10Service,
    private mantenimientoAV: Maintenance6x6AvService
  ) {}

  getService(idArea: string): IMantenimientoService {
    switch (idArea) {
      case '1': return this.mantenimientoSys;
      case '2': return this.mantenimientoAV;
      default: throw new Error('Área no soportada');
    }
  }
}
