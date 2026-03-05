import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

import { ModalFinalCommentsComponent } from '../../dialogs/modal-final-comments/modal-final-comments.component';
import { ModalVisorVariasImagenesComponent } from '../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { Maintenance10x10Service } from '../../services/maintenance-10x10.service';
import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';
import { MantenimientoSysAv } from '../../interfaces/mantenimiento-sys-av.interface';
import { ChatMantenimientoSysAvComponent } from '../../dialogs/sistemas-av/chat-mantenimiento-sys-av-dialog/chat-mantenimiento-sys-av-dialog.component';
import { SubirImagenesSysAvComponent } from "../../dialogs/systems/subir-imagenes-sys-av-dialog/subir-imagenes-sys-av-dialog.component";

@Component({
  selector: 'app-tabla-mantenimientos-sys-av',
  styleUrl: './tabla-mantenimientos-sys-av.component.scss',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalFinalCommentsComponent,
    ModalVisorVariasImagenesComponent,
    ChatMantenimientoSysAvComponent,
    SubirImagenesSysAvComponent
  ],
  templateUrl: './tabla-mantenimientos-sys-av.component.html',
})
export class TablaMantenimientosSysAvComponent {
  @Input() mantenimientos: MantenimientoSysAv[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Input() idSucursal?: string;
  @Input() mostrarChat: boolean = false;
  @Output() clickEvent = new EventEmitter<MantenimientoSysAv>();

  mantenimientoSeleccionado: MantenimientoSysAv | undefined;
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
    public dateHelpder: DatesHelperService,
    private cdr: ChangeDetectorRef,
    public maintenance10x10Service: Maintenance10x10Service,
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

  abrirModalVisorImagen(mantenimiento: MantenimientoSysAv, campo: string) {
    this.imagenes = [];
    this.tituloVisor = campo;

    switch (campo) {

      // case 'PANTALLAS':
      //   this.imagenes = mantenimiento.tvs?.flatMap(tv => tv.evidenciaUrls || []) || [];
      //   break;

      case 'VIDEO':
        this.imagenes = mantenimiento.mantenimientoSenalVideoEvidenciaUrls || [];
        break;

      case 'IMAGEN':
        this.imagenes = mantenimiento.mantenimientoParametrosImagenEvidenciaUrls || [];
        break;

      // case 'BOCINAS':
      //   this.imagenes = mantenimiento.bocinas?.flatMap(b => b.evidenciaUrls || []) || [];
      //   break;

      case 'AUDIO':
        this.imagenes = mantenimiento.mantenimientoTransmisionAudioEvidenciaUrls || [];
        break;

      case 'CABLEADO':
        this.imagenes = mantenimiento.mantenimientoOrdenamientoCableadoEvidenciaUrls || [];
        break;

      case 'RACK':
        this.imagenes = mantenimiento.mantenimientoLimpiezaRackEvidenciaUrls || [];
        break;

      case 'ELECTRICO':
        this.imagenes = mantenimiento.mantenimientoElectricoEvidenciaUrls || [];
        break;
    }

    this.mostrarModalVisorImagen = true;
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
    this.actualizarImagenesPorTitulo(event.titulo, event.url)
  }

  async actualizarImagenesPorTitulo(titulo: string, url: string) {
    if (!this.mantenimientoSeleccionado) return;

    switch (titulo) {

      case 'PANTALLAS':
        // if (this.mantenimientoSeleccionado.tvs) {
        //   this.mantenimientoSeleccionado.tvs = this.mantenimientoSeleccionado.tvs.map(tv => ({
        //     ...tv,
        //     evidenciaUrls: (tv.evidenciaUrls || []).filter(u => u !== url)
        //   }));
        // }
        break;

      case 'VIDEO':
        this.mantenimientoSeleccionado.mantenimientoSenalVideoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoSenalVideoEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'IMAGEN':
        this.mantenimientoSeleccionado.mantenimientoParametrosImagenEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoParametrosImagenEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'BOCINAS':
        // if (this.mantenimientoSeleccionado.bocinas) {
        //   this.mantenimientoSeleccionado.bocinas = this.mantenimientoSeleccionado.bocinas.map(b => ({
        //     ...b,
        //     evidenciaUrls: (b.evidenciaUrls || []).filter(u => u !== url)
        //   }));
        // }
        break;

      case 'AUDIO':
        this.mantenimientoSeleccionado.mantenimientoTransmisionAudioEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoTransmisionAudioEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'CABLEADO':
        this.mantenimientoSeleccionado.mantenimientoOrdenamientoCableadoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoOrdenamientoCableadoEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'RACK':
        this.mantenimientoSeleccionado.mantenimientoLimpiezaRackEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoLimpiezaRackEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'ELECTRICO':
        this.mantenimientoSeleccionado.mantenimientoElectricoEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoElectricoEvidenciaUrls || []).filter(u => u !== url);
        break;
    }

    await this.maintenance10x10Service.updateAV(this.mantenimientoSeleccionado.id, this.mantenimientoSeleccionado);
  }
}
