import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { ModalFinalCommentsComponent } from '../../../dialogs/modal-final-comments/modal-final-comments.component';
import { ModalAvMttoImguploaderComponent } from '../../../dialogs/audio-video/modal-av-mtto-imguploader/modal-av-mtto-imguploader.component';
import { ModalVisorVariasImagenesComponent } from '../../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { ModalMaintenanceChatComponent } from '../../../dialogs/modal-maintenance-chat/modal-maintenance-chat.component';
import { Usuario } from '../../../../usuarios/models/usuario.model';
import { DatesHelperService } from '../../../../shared/helpers/dates-helper.service';
import { Maintenance6x6AvService } from '../../../services/maintenance-av.service';
import { Mantenimiento6x6AV } from '../../../interfaces/mantenimiento-av.model';


@Component({
  selector: 'app-branch-maintenance-table-av',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalFinalCommentsComponent,
    ModalAvMttoImguploaderComponent,
    ModalVisorVariasImagenesComponent,
    ModalMaintenanceChatComponent
  ],
  templateUrl: './branch-maintenance-table-av.component.html',
  styleUrl: './branch-maintenance-table-av.component.scss'
})

export class BranchMaintenanceTableAvComponent {
  @Input() mantenimientos: Mantenimiento6x6AV[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Input() mostrarChat: boolean = false;
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
  imagenes: string[] = []; // ✅ arreglo de imágenes

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
        this.imagenes = mantenimiento.mantenimientoConexionesEvidenciaUrls || [];
        break;
      case 'CABLEADO':
        this.imagenes = mantenimiento.mantenimientoCableadoEvidenciaUrls || [];;
        break;
      case 'RACK':
        this.imagenes = mantenimiento.mantenimientoRackEvidenciaUrls || [];
        break;
      case 'CONTROLES':
        this.imagenes = mantenimiento.mantenimientoControlesEvidenciaUrls || [];
        break;
      case 'NIVEL AUDIO':
        this.imagenes = mantenimiento.mantenimientoNivelAudioEvidenciaUrls || [];
        break;
      case 'CANALES':
        this.imagenes = mantenimiento.mantenimientoCanalesEvidenciaUrls || [];
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

  verificarChatNoLeido(mantenimiento: Mantenimiento6x6AV) {
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
      const comentarios = mantenimiento.comentarios;

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

      case 'CONEXIONES':
        this.mantenimientoSeleccionado.mantenimientoConexionesEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoConexionesEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'CABLEADO':
        this.mantenimientoSeleccionado.mantenimientoCableadoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoCableadoEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'RACK':
        this.mantenimientoSeleccionado.mantenimientoRackEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoRackEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'CONTROLES':
        this.mantenimientoSeleccionado.mantenimientoControlesEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoControlesEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'NIVEL AUDIO':
        this.mantenimientoSeleccionado.mantenimientoNivelAudioEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoNivelAudioEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'CANALES':
        this.mantenimientoSeleccionado.mantenimientoCanalesEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoCanalesEvidenciaUrls || []).filter(u => u !== url);
        break;
    }

    await this.maintenance6x6AvService.update(
      this.mantenimientoSeleccionado.id,
      this.mantenimientoSeleccionado
    );
  }

}
