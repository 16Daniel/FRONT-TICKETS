import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

import { ModalMaintenanceMttoImguploaderComponent } from '../../../dialogs/manteinance/modal-maintenance-mtto-imguploader/modal-maintenance-mtto-imguploader.component';
import { ModalVisorVariasImagenesComponent } from '../../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { ModalFinalCommentsComponent } from '../../../dialogs/modal-final-comments/modal-final-comments.component';
import { ModalMaintenanceChatComponent } from '../../../dialogs/modal-maintenance-chat/modal-maintenance-chat.component';
import { Usuario } from '../../../../usuarios/models/usuario.model';
import { DatesHelperService } from '../../../../shared/helpers/dates-helper.service';
import { MaintenanceMtooService } from '../../../services/maintenance-mtto.service';
import { MantenimientoMtto } from '../../../interfaces/mantenimiento-mtto.model';

@Component({
  selector: 'app-branch-maintenance-table-mtto',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalMaintenanceMttoImguploaderComponent,
    ModalVisorVariasImagenesComponent,
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
  imagenes: string[] = []; // ✅ arreglo de imágenes

  constructor(
    public datesHelper: DatesHelperService,
    private cdr: ChangeDetectorRef,
    public maintenanceMtooService: MaintenanceMtooService,
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

  abrirModalVisorImagen(mantenimiento: MantenimientoMtto, campo: string) {
    this.urlImagen = '';
    this.tituloVisor = campo;

    switch (campo) {
      case 'TERMOSTATO':
        this.imagenes = mantenimiento.mantenimientoTermostatoEvidenciaUrls || [];
        break;
      case 'PERILLAS':
        this.imagenes = mantenimiento.mantenimientoPerillasEvidenciaUrls || [];
        break;
      case 'TORNILLERIA':
        this.imagenes = mantenimiento.mantenimientoTornilleriaEvidenciaUrls || [];
        break;
      case 'RUEDAS':
        this.imagenes = mantenimiento.mantenimientoRuedasEvidenciaUrls || [];
        break;
      case 'CABLEADO':
        this.imagenes = mantenimiento.mantenimientoCableadoEvidenciaUrls || [];
        break;
      case 'TINAS':
        this.imagenes = mantenimiento.mantenimientoTinaEvidenciaUrls || [];
        break;
      case 'MANGUERAS':
        this.imagenes = mantenimiento.mantenimientoManguerasEvidenciaUrls || [];
        break;
      case 'LLAVES':
        this.imagenes = mantenimiento.mantenimientoLlavesDePasoEvidenciaUrls || [];
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

  onEliminarImagen(event: any) {
    this.actualizarImagenesPorTitulo(event.titulo, event.url)
  }

  async actualizarImagenesPorTitulo(titulo: string, url: string) {
    if (!this.mantenimientoSeleccionado) return;

    switch (titulo) {

      case 'TERMOSTATO':
        this.mantenimientoSeleccionado.mantenimientoTermostatoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoTermostatoEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'PERILLAS':
        this.mantenimientoSeleccionado.mantenimientoPerillasEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoPerillasEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'TORNILLERIA':
        this.mantenimientoSeleccionado.mantenimientoTornilleriaEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoTornilleriaEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'RUEDAS':
        this.mantenimientoSeleccionado.mantenimientoRuedasEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoRuedasEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'CABLEADO':
        this.mantenimientoSeleccionado.mantenimientoCableadoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoCableadoEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'TINAS':
        this.mantenimientoSeleccionado.mantenimientoTinaEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoTinaEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'MANGUERAS':
        this.mantenimientoSeleccionado.mantenimientoManguerasEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoManguerasEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'LLAVES':
        this.mantenimientoSeleccionado.mantenimientoLlavesDePasoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoLlavesDePasoEvidenciaUrls || []).filter(u => u !== url);
        break;
    }

    await this.maintenanceMtooService.update(this.mantenimientoSeleccionado.id, this.mantenimientoSeleccionado);
  }

}
