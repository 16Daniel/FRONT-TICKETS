import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../../models/usuario.model';
import { ModalFinalCommentsComponent } from '../../../../modals/maintenance/modal-final-comments/modal-final-comments.component';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { Maintenance10x10Service } from '../../../../services/maintenance-10x10.service';
import { ModalSysMttoImguploaderComponent } from '../../../../modals/maintenance/systems/modal-sys-mtto-imguploader/modal-sys-mtto-imguploader.component';
import { ModalVisorImagenesComponent } from '../../../../modals/modal-visor-imagenes/modal-visor-imagenes.component';

@Component({
  selector: 'app-branch-maintenance-table',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalFinalCommentsComponent,
    ModalSysMttoImguploaderComponent,
    ModalVisorImagenesComponent
  ],
  templateUrl: './branch-maintenance-table.component.html',
})
export class BranchMaintenanceTableComponent {
  @Input() mantenimientos: Mantenimiento10x10[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Output() clickEvent = new EventEmitter<Mantenimiento10x10>();
  mantenimientoSeleccionado: Mantenimiento10x10 | undefined;
  mostrarModalComentarios: boolean = false;
  mostrarModalSubirImagen: boolean = false;
  mostrarModalVisorImagen: boolean = false;
  tituloEvidencia: string | undefined;
  urlImagen: string | undefined;
  usuario: Usuario;
  tituloVisor: string | undefined;

  constructor(
    public dateHelpder: DatesHelperService,
    private cdr: ChangeDetectorRef,
    public maintenance10x10Service: Maintenance10x10Service
  ) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  obtenerNombreResponsable(idUsuario: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == idUsuario);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  abrirModalImagen(mantenimiento: any, campo: string) {
    this.mantenimientoSeleccionado = mantenimiento;
    this.tituloEvidencia = campo;


    if (this.usuario.idRol == '4') {
      Swal.fire({
        title: "SELECCIONA LA ACCION?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "VER IMÁGEN",
        denyButtonText: `SUBIR IMAGEN`
      }).then((result) => {
        if (result.isConfirmed) {
          this.abrirModalVisorImagen(mantenimiento, campo);
          this.cdr.detectChanges();
        } else if (result.isDenied) {
          this.mostrarModalSubirImagen = true;
          this.cdr.detectChanges();
        }
      });


    }
    else if (this.usuario.idRol == '1' || this.usuario.idRol == '5') {
      this.abrirModalVisorImagen(mantenimiento, campo);
    }
  }

  abrirModalVisorImagen(mantenimiento: Mantenimiento10x10, campo: string) {
    this.urlImagen = '';
    this.tituloVisor = campo;

    switch (campo) {
      case 'CAJA':
        this.urlImagen = mantenimiento.mantenimientoCajaEvidenciaUrl;
        break;
      case 'IMPRESORAS':
        this.urlImagen = mantenimiento.mantenimientoImpresorasEvidenciaUrl;
        break;
      case 'RACK':
        this.urlImagen = mantenimiento.mantenimientoRackEvidenciaUrl;
        break;
      case 'TPV':
        this.urlImagen = mantenimiento.mantenimientoPuntosVentaTabletasEvidenciaUrl;
        break;
      case 'CONTENIDOS':
        this.urlImagen = mantenimiento.mantenimientoContenidosSistemaCableEvidenciaUrl;
        break;
      case 'INTERNET':
        this.urlImagen = mantenimiento.mantenimientoInternetEvidenciaUrl;
        break;
      case 'CCTV':
        this.urlImagen = mantenimiento.mantenimientoCCTVEvidenciaUrl;
        break;
      case 'NO BRAKES':
        this.urlImagen = mantenimiento.mantenimientoNoBrakesEvidenciaUrl;
        break;
      case 'TIEMPOS COCINA':
        this.urlImagen = mantenimiento.mantenimientoTiemposCocinaEvidenciaUrl;
        break;
      case 'APPS':
        this.urlImagen = mantenimiento.mantenimientoConcentradorAppsEvidenciaUrl;
        break;
    }

    this.mostrarModalVisorImagen = true;
  }

  abrirModalDetalle(mantenimiento: any) {
    this.mantenimientoSeleccionado = mantenimiento;
    this.mostrarModalComentarios = true;
  }
}
