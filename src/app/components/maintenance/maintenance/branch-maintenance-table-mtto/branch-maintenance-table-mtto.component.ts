import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';

import { Usuario } from '../../../../models/usuario.model';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { MaintenanceMtooService } from '../../../../services/maintenance-mtto.service';
import { MantenimientoMtto } from '../../../../models/mantenimiento-mtto.model';

@Component({
  selector: 'app-branch-maintenance-table-mtto',
  standalone: true,
  imports: [TableModule, CommonModule],
  templateUrl: './branch-maintenance-table-mtto.component.html',
  styleUrl: './branch-maintenance-table-mtto.component.scss'
})
export class BranchMaintenanceTableMttoComponent {
  @Input() mantenimientos: MantenimientoMtto[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Output() clickEvent = new EventEmitter<MantenimientoMtto>();
  mantenimientoSeleccionado: MantenimientoMtto | undefined;

  constructor(
    public datesHelper: DatesHelperService,
    public maintenanceMtooService: MaintenanceMtooService
  ) { }

  obtenerNombreResponsable(idUsuario: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == idUsuario);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  onClick() {
    this.clickEvent.emit(this.mantenimientoSeleccionado);
  }
}
