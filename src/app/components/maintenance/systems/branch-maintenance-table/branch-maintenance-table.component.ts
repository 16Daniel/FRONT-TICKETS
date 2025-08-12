import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../../models/usuario.model';
import { ModalFinalCommentsComponent } from '../../../../modals/maintenance/modal-final-comments/modal-final-comments.component';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { Maintenance10x10Service } from '../../../../services/maintenance-10x10.service';
import { ModalSysMttoImguploaderComponent } from '../../../../modals/maintenance/systems/modal-sys-mtto-imguploader/modal-sys-mtto-imguploader.component';

@Component({
  selector: 'app-branch-maintenance-table',
  standalone: true,
  imports: [TableModule, CommonModule, ModalFinalCommentsComponent, ModalSysMttoImguploaderComponent],
  templateUrl: './branch-maintenance-table.component.html',
})
export class BranchMaintenanceTableComponent {
  @Input() mantenimientos: Mantenimiento10x10[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Output() clickEvent = new EventEmitter<Mantenimiento10x10>();
  mantenimientoSeleccionado: Mantenimiento10x10 | undefined;
  mostrarModalComentarios: boolean = false;
  mostrarModalImagen: boolean = false;
  tituloEvidencia: string | undefined;

  constructor(public dateHelpder: DatesHelperService, public maintenance10x10Service: Maintenance10x10Service) { }

  obtenerNombreResponsable(idUsuario: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == idUsuario);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  abrirModalSubirEvidencia(mantenimiento: any, campo: string) {
    this.tituloEvidencia = campo;
    // this.mantenimientoSeleccionado = mantenimiento;
    console.log(campo)
    // this.campoSeleccionado = campo; // por si quieres saber de qué parámetro es
    this.mostrarModalImagen = true;
  }

  abrirModalDetalle(mantenimiento: any) {
    this.mantenimientoSeleccionado = mantenimiento;
    this.mostrarModalComentarios = true;
  }
}
