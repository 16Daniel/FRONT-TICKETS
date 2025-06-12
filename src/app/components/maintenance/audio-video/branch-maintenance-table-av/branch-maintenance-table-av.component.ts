import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';

import { Mantenimiento6x6AV } from '../../../../models/mantenimiento-av.model';
import { Usuario } from '../../../../models/usuario.model';
// import { MessageService } from 'primeng/api';
// import { UsersService } from '../../../../services/users.service';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { MaintenancesHelperService } from '../../../../helpers/maintenances-helper.service';

@Component({
  selector: 'app-branch-maintenance-table-av',
  standalone: true,
  imports: [TableModule, CommonModule],
  templateUrl: './branch-maintenance-table-av.component.html',
  styleUrl: './branch-maintenance-table-av.component.scss'
})
export class BranchMaintenanceTableAvComponent {
  @Input() mantenimientos: Mantenimiento6x6AV[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Output() clickEvent = new EventEmitter<Mantenimiento6x6AV>();
  mantenimientoSeleccionado: Mantenimiento6x6AV | undefined;

  constructor(
    // private messageService: MessageService,
    // private usersService: UsersService,
    public datesHelper: DatesHelperService,
    public maintenancesHelper: MaintenancesHelperService
  ) {}

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
