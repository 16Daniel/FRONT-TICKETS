import { Injectable } from "@angular/core";
import { Maintenance10x10Service } from "../../../../services/maintenance-10x10.service";
import { Maintenance6x6AvService } from "../../../../services/maintenance-av.service";
import { IMantenimientoService } from "../../../../interfaces/manteinance.interface";
import { MaintenanceMtooService } from "../../../../services/maintenance-mtto.service";

@Injectable({ providedIn: 'root' })
export class MantenimientoFactoryService {
  constructor(
    private mantenimientoSys: Maintenance10x10Service,
    private mantenimientoAV: Maintenance6x6AvService,
    private mantenimientoMtto: MaintenanceMtooService
  ) {}

  getService(idArea: string): IMantenimientoService {
    switch (idArea.toString()) {
      case '1': return this.mantenimientoSys;
      case '2': return this.mantenimientoAV;
      case '4': return this.mantenimientoMtto;
      default: throw new Error('Área no soportada');
    }
  }
}
