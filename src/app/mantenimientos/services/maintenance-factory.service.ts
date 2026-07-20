import { Injectable } from "@angular/core";
import { MantenimientosSistemasService } from "./mantenimientos-sistemas.service";
import { MaintenanceAvService } from "./maintenance-av.service";
import { MaintenanceMtooService } from "./maintenance-mtto.service";
import { IMantenimientoService } from "../interfaces/manteinance.interface";

@Injectable({ providedIn: 'root' })
export class MantenimientoFactoryService {
  constructor(
    private mantenimientoSys: MantenimientosSistemasService,
    private mantenimientoAV: MaintenanceAvService,
    private mantenimientoMtto: MaintenanceMtooService
  ) { }

  getService(idArea: string, itav?: 'sistemas' | 'av'): IMantenimientoService {
    switch (idArea.toString()) {
      case '1': {
        if (itav == 'sistemas')
          return this.mantenimientoSys
        else {
          return this.mantenimientoAV;
        }
      }; case '2': return this.mantenimientoAV;
      case '4': return this.mantenimientoMtto;
      case '20': return this.mantenimientoMtto;
      default: throw new Error('Área no soportada');
    }
  }
}
