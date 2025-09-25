import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

import { Usuario } from '../../../../models/usuario.model';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { MaintenanceMtooService } from '../../../../services/maintenance-mtto.service';
import { MantenimientoMtto } from '../../../../models/mantenimiento-mtto.model';
import { ModalMaintenanceMttoImguploaderComponent } from '../../../../modals/maintenance/manteinance/modal-maintenance-mtto-imguploader/modal-maintenance-mtto-imguploader.component';
import { ModalVisorImagenesComponent } from '../../../../modals/modal-visor-imagenes/modal-visor-imagenes.component';
import { ModalFinalCommentsComponent } from '../../../../modals/maintenance/modal-final-comments/modal-final-comments.component';
import { ModalMaintenanceChatComponent } from '../../../../modals/maintenance/modal-maintenance-chat/modal-maintenance-chat.component';

@Component({
  selector: 'app-branch-maintenance-table-mtto',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalMaintenanceMttoImguploaderComponent,
    ModalVisorImagenesComponent,
    ModalFinalCommentsComponent,
    ModalMaintenanceChatComponent
  ],
  templateUrl: './branch-maintenance-table-mtto.component.html',
  styleUrl: './branch-maintenance-table-mtto.component.scss'
})
export class BranchMaintenanceTableMttoComponent {
  @Input() mantenimientos: MantenimientoMtto[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Input() mostrarChat: boolean = false;
  @Output() clickEvent = new EventEmitter<MantenimientoMtto>();
  
  mantenimientoSeleccionado: MantenimientoMtto | undefined;
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
    public maintenanceMtooService: MaintenanceMtooService,
  ) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  // ngOnChanges(changes: SimpleChanges) {
  //   this.observaActualizacionesChatTicket(changes);
  // }

  // observaActualizacionesChatTicket(changes: SimpleChanges) {
  //   if (changes['mantenimientos'] && changes['mantenimientos'].currentValue) {
  //     console.log('Mantenimientos actualizados');
  //   }
  // }

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

  abrirModalVisorImagen(mantenimiento: MantenimientoMtto, campo: string) {
    this.urlImagen = '';
    this.tituloVisor = campo;

    switch (campo) {
      case 'TERMOSTATO':
        this.urlImagen = mantenimiento.mantenimientoTermostatoEvidenciaUrl;
        break;
      case 'PERILLAS':
        this.urlImagen = mantenimiento.mantenimientoPerillasEvidenciaUrl;
        break;
      case 'TORNILLERIA':
        this.urlImagen = mantenimiento.mantenimientoTornilleriaEvidenciaUrl;
        break;
      case 'RUEDAS':
        this.urlImagen = mantenimiento.mantenimientoRuedasEvidenciaUrl;
        break;
      case 'CABLEADO':
        this.urlImagen = mantenimiento.mantenimientoCableadoEvidenciaUrl;
        break;
      case 'TINAS':
        this.urlImagen = mantenimiento.mantenimientoTinaEvidenciaUrl;
        break;
      case 'MANGUERAS':
        this.urlImagen = mantenimiento.mantenimientoManguerasEvidenciaUrl;
        break;
      case 'LLAVES':
        this.urlImagen = mantenimiento.mantenimientoLlavesDePasoEvidenciaUrl;
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

  verificarChatNoLeido(mantenimiento: MantenimientoMtto) {
    if (!mantenimiento.participantesChat)
      mantenimiento.participantesChat = [];

    if (!mantenimiento.comentarios)
      mantenimiento.comentarios = [];

    const participantes = mantenimiento.participantesChat.sort(
      (a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido
    );
    const participante = participantes.find(
      (p) => p.idUsuario === this.usuario.id
    );

    if (participante) {
      const ultimoComentarioLeido = this.mostrarModalChat
        ? mantenimiento.comentarios.length
        : participante.ultimoComentarioLeido;
      let comentarios = mantenimiento.comentarios;

      // Si el último comentario leído es menor que la longitud actual de los comentarios
      return comentarios.length > ultimoComentarioLeido;
    }

    return false;
  }
}
