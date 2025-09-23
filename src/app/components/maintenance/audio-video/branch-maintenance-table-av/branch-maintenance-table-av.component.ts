import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

import { Mantenimiento6x6AV } from '../../../../models/mantenimiento-av.model';
import { Usuario } from '../../../../models/usuario.model';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { Maintenance6x6AvService } from '../../../../services/maintenance-av.service';
import { ModalFinalCommentsComponent } from '../../../../modals/maintenance/modal-final-comments/modal-final-comments.component';
import { ModalVisorImagenesComponent } from '../../../../modals/modal-visor-imagenes/modal-visor-imagenes.component';
import { ModalAvMttoImguploaderComponent } from '../../../../modals/maintenance/audio-video/modal-av-mtto-imguploader/modal-av-mtto-imguploader.component';
import { ModalMaintenanceChatComponent } from '../../../../modals/maintenance/modal-maintenance-chat/modal-maintenance-chat.component';

@Component({
  selector: 'app-branch-maintenance-table-av',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalFinalCommentsComponent,
    ModalAvMttoImguploaderComponent,
    ModalVisorImagenesComponent,
    ModalMaintenanceChatComponent
  ],
  templateUrl: './branch-maintenance-table-av.component.html',
  styleUrl: './branch-maintenance-table-av.component.scss'
})

export class BranchMaintenanceTableAvComponent {
  @Input() mantenimientos: Mantenimiento6x6AV[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Output() clickEvent = new EventEmitter<Mantenimiento6x6AV>();
  mantenimientoSeleccionado: Mantenimiento6x6AV | undefined;
  mostrarModalComentarios: boolean = false;
  mostrarModalChat: boolean = false;
  mostrarModalSubirImagen: boolean = false;
  mostrarModalVisorImagen: boolean = false;
  tituloEvidencia: string | undefined;
  urlImagen: string | undefined;
  usuario: Usuario;
  tituloVisor: string | undefined;

  constructor(
    public datesHelper: DatesHelperService,
    private cdr: ChangeDetectorRef,
    public maintenance6x6AvService: Maintenance6x6AvService
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

  abrirModalVisorImagen(mantenimiento: Mantenimiento6x6AV, campo: string) {
    this.urlImagen = '';
    this.tituloVisor = campo;

    switch (campo) {
      case 'CONEXIONES':
        this.urlImagen = mantenimiento.mantenimientoConexionesEvidenciaUrl;
        break;
      case 'CABLEADO':
        this.urlImagen = mantenimiento.mantenimientoCableadoEvidenciaUrl;
        break;
      case 'RACK':
        this.urlImagen = mantenimiento.mantenimientoRackEvidenciaUrl;
        break;
      case 'CONTROLES':
        this.urlImagen = mantenimiento.mantenimientoControlesEvidenciaUrl;
        break;
      case 'NIVEL AUDIO':
        this.urlImagen = mantenimiento.mantenimientoNivelAudioEvidenciaUrl;
        break;
      case 'CANALES':
        this.urlImagen = mantenimiento.mantenimientoCanalesEvidenciaUrl;
        break;
    }

    this.mostrarModalVisorImagen = true;
  }

  abrirModalDetalle(mantenimiento: any) {
    this.mantenimientoSeleccionado = mantenimiento;
    this.mostrarModalComentarios = true;
  }

  onClickChat(mantenimiento: any) {
    this.mantenimientoSeleccionado = mantenimiento;
    this.mostrarModalChat = true;
  }
}
