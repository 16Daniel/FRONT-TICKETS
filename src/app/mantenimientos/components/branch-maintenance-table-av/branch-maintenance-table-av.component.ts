import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { ModalFinalCommentsComponent } from '../../dialogs/modal-final-comments/modal-final-comments.component';
import { ModalAvMttoImguploaderComponent } from '../../dialogs/audio-video/modal-av-mtto-imguploader/modal-av-mtto-imguploader.component';
import { ModalVisorVariasImagenesComponent } from '../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { ModalMaintenanceChatComponent } from '../../dialogs/modal-maintenance-chat/modal-maintenance-chat.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { Maintenance6x6AvService } from '../../services/maintenance-av.service';
import { MantenimientoSysAv } from '../../interfaces/mantenimiento-sys-av.interface';
import { EvidenciaSysAv, VisorImagenesSysAvComponent } from '../../dialogs/sistemas-av/visor-imagenes-sys-av-dialog/visor-imagenes-sys-av-dialog.component';
import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';
import { SubirImagenesAv2Component } from "../../dialogs/audio-video/subir-imagenes-av-dialog-2/subir-imagenes-av-dialog-2.component";


@Component({
  selector: 'app-branch-maintenance-table-av',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalFinalCommentsComponent,
    ModalAvMttoImguploaderComponent,
    ModalVisorVariasImagenesComponent,
    ModalMaintenanceChatComponent,
    VisorImagenesSysAvComponent,
    SubirImagenesAv2Component
],
  templateUrl: './branch-maintenance-table-av.component.html',
  styleUrl: './branch-maintenance-table-av.component.scss'
})

export class BranchMaintenanceTableAvComponent {
  @Input() mantenimientos: MantenimientoSysAv[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Input() idSucursal?: string;
  @Input() mostrarChat: boolean = false;
  @Output() clickEvent = new EventEmitter<MantenimientoSysAv>();

  mantenimientoSeleccionado: MantenimientoSysAv | undefined;
  mostrarModalComentarios: boolean = false;
  mostrarModalChat: boolean = false;
  mostrarModalSubirImagen: boolean = false;
  mostrarModalSubirImagen2: boolean = false;
  mostrarModalVisorImagen: boolean = false;
  mostrarModalVisorImagenAV: boolean = false;
  tituloEvidencia: string | undefined;
  urlImagen: string | undefined;
  usuario: Usuario;
  tituloVisor: string | undefined;
  imagenes: string[] = [];
  imagenesPorDispositivo: string[][] = [];
  evidencias: EvidenciaSysAv[] = [];

  constructor(
    public dateHelpder: DatesHelperService,
    private cdr: ChangeDetectorRef,
    public maintenance6x6AvService: Maintenance6x6AvService,
    private mantenimientoFactory: MantenimientoFactoryService,
    private datesHelper: DatesHelperService
  ) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  obtenerMantenimientos(idsSucursales: string[]) {
    const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);

    servicio
      .getUltimosMantenimientos(idsSucursales)
      .subscribe((result: any) => {
        let data = result.filter((element: any) => element.length > 0);
        this.mantenimientos = [];
        for (let itemdata of data) {
          for (let item of itemdata) {
            this.mantenimientos.push(item);
          }
        }

        this.mantenimientos = this.mantenimientos.map(x => {
          x.fecha = this.datesHelper.getDate(x.fecha);
          return x;
        });

        this.cdr.detectChanges();
      });
  }

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


    // Solo analistas
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

        }
        else if (result.isDenied) {
          debugger
          if (this.tituloEvidencia == 'PANTALLAS' || this.tituloEvidencia == 'BOCINAS')
            this.mostrarModalSubirImagen2 = true;
          else
            this.mostrarModalSubirImagen = true;
          this.cdr.detectChanges();
        }
      });


    }
    // Solo administradores
    else if (this.usuario.idRol == '1' || this.usuario.idRol == '5') {
      this.abrirModalVisorImagen(mantenimiento, campo);
    }
  }

  abrirModalVisorImagen(mantenimiento: MantenimientoSysAv, campo: string) {

    this.imagenes = [];
    this.imagenesPorDispositivo = [];
    this.evidencias = [];

    this.tituloVisor = campo;

    switch (campo) {

      case 'PANTALLAS':

        this.evidencias = mantenimiento.tvs || [];
        this.imagenesPorDispositivo =
          mantenimiento.tvs?.map(tv => tv.evidenciaUrls || []) || [];

        this.mostrarModalVisorImagenAV = true;

        break;

      case 'VIDEO':

        this.imagenes = mantenimiento.mantenimientoSenalVideoEvidenciaUrls || [];
        this.mostrarModalVisorImagen = true;

        break;

      case 'IMAGEN':

        this.imagenes = mantenimiento.mantenimientoParametrosImagenEvidenciaUrls || [];
        this.mostrarModalVisorImagen = true;

        break;

      case 'BOCINAS':

        this.evidencias = mantenimiento.bocinas || [];
        this.imagenesPorDispositivo =
          mantenimiento.bocinas?.map(b => b.evidenciaUrls || []) || [];

        this.mostrarModalVisorImagenAV = true;

        break;

      case 'AUDIO':

        this.imagenes = mantenimiento.mantenimientoTransmisionAudioEvidenciaUrls || [];
        this.mostrarModalVisorImagen = true;

        break;

      case 'CABLEADO':

        this.imagenes = mantenimiento.mantenimientoOrdenamientoCableadoEvidenciaUrls || [];
        this.mostrarModalVisorImagen = true;

        break;

      case 'RACK':

        this.imagenes = mantenimiento.mantenimientoLimpiezaRackEvidenciaUrls || [];
        this.mostrarModalVisorImagen = true;

        break;

      case 'ELECTRICO':

        this.imagenes = mantenimiento.mantenimientoElectricoEvidenciaUrls || [];
        this.mostrarModalVisorImagen = true;

        break;
    }

    this.cdr.detectChanges();
  }

  abrirModalDetalle(mantenimiento: any) {
    this.mantenimientoSeleccionado = mantenimiento;
    this.mostrarModalComentarios = true;
  }

  onClickChat(mantenimiento: any) {
    this.mantenimientoSeleccionado = mantenimiento;
    this.mostrarModalChat = true;
  }

  verificarChatNoLeido(mantenimiento: MantenimientoSysAv) {
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
    this.actualizarImagenesPorTitulo(event.titulo, event.url, event.dispositivoIndex)
  }

  async actualizarImagenesPorTitulo(titulo: string, url: string, dispositivoIndex?: number) {

    if (!this.mantenimientoSeleccionado) return;

    switch (titulo) {

      case 'PANTALLAS':

        if (this.mantenimientoSeleccionado.tvs && dispositivoIndex !== undefined) {

          this.mantenimientoSeleccionado.tvs[dispositivoIndex].evidenciaUrls =
            (this.mantenimientoSeleccionado.tvs[dispositivoIndex].evidenciaUrls || [])
              .filter(u => u !== url);

        }

        break;

      case 'VIDEO':

        this.mantenimientoSeleccionado.mantenimientoSenalVideoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoSenalVideoEvidenciaUrls || [])
            .filter(u => u !== url);

        break;

      case 'IMAGEN':

        this.mantenimientoSeleccionado.mantenimientoParametrosImagenEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoParametrosImagenEvidenciaUrls || [])
            .filter(u => u !== url);

        break;

      case 'BOCINAS':

        if (this.mantenimientoSeleccionado.bocinas && dispositivoIndex !== undefined) {

          this.mantenimientoSeleccionado.bocinas[dispositivoIndex].evidenciaUrls =
            (this.mantenimientoSeleccionado.bocinas[dispositivoIndex].evidenciaUrls || [])
              .filter(u => u !== url);

        }

        break;

      case 'AUDIO':

        this.mantenimientoSeleccionado.mantenimientoTransmisionAudioEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoTransmisionAudioEvidenciaUrls || [])
            .filter(u => u !== url);

        break;

      case 'CABLEADO':

        this.mantenimientoSeleccionado.mantenimientoOrdenamientoCableadoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoOrdenamientoCableadoEvidenciaUrls || [])
            .filter(u => u !== url);

        break;

      case 'RACK':

        this.mantenimientoSeleccionado.mantenimientoLimpiezaRackEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoLimpiezaRackEvidenciaUrls || [])
            .filter(u => u !== url);

        break;

      case 'ELECTRICO':

        this.mantenimientoSeleccionado.mantenimientoElectricoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoElectricoEvidenciaUrls || [])
            .filter(u => u !== url);

        break;
    }

    await this.maintenance6x6AvService.update(
      this.mantenimientoSeleccionado.id,
      this.mantenimientoSeleccionado
    );
  }
}
