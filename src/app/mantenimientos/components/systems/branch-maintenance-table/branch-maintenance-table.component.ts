import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../../models/usuario.model';
import { ModalFinalCommentsComponent } from '../../../../modals/maintenance/modal-final-comments/modal-final-comments.component';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { Maintenance10x10Service } from '../../../../services/maintenance-10x10.service';
import { ModalSysMttoImguploaderComponent } from '../../../../modals/maintenance/systems/modal-sys-mtto-imguploader/modal-sys-mtto-imguploader.component';
import { ModalMaintenanceChatComponent } from '../../../../modals/maintenance/modal-maintenance-chat/modal-maintenance-chat.component';
import { MantenimientoFactoryService } from '../../../../services/maintenance-factory.service';
import { ModalVisorVariasImagenesComponent } from '../../../../modals/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';

@Component({
  selector: 'app-branch-maintenance-table',
  styleUrl: './branch-maintenance-table.component.scss',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalFinalCommentsComponent,
    ModalSysMttoImguploaderComponent,
    ModalVisorVariasImagenesComponent,
    ModalMaintenanceChatComponent
  ],
  templateUrl: './branch-maintenance-table.component.html',
})
export class BranchMaintenanceTableComponent {
  @Input() mantenimientos: Mantenimiento10x10[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Input() idSucursal?: string;
  @Input() mostrarChat: boolean = false;
  @Output() clickEvent = new EventEmitter<Mantenimiento10x10>();

  mantenimientoSeleccionado: Mantenimiento10x10 | undefined;
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
    debugger
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

  abrirModalVisorImagen(mantenimiento: Mantenimiento10x10, campo: string) {
    this.imagenes = [];
    this.tituloVisor = campo;

    switch (campo) {
      case 'CAJA':
        this.imagenes = mantenimiento.mantenimientoCajaEvidenciaUrls || [];
        break;
      case 'IMPRESORAS':
        this.imagenes = mantenimiento.mantenimientoImpresorasEvidenciaUrls || [];
        break;
      case 'RACK':
        this.imagenes = mantenimiento.mantenimientoRackEvidenciaUrls || [];
        break;
      case 'TPV':
        this.imagenes = mantenimiento.mantenimientoPuntosVentaTabletasEvidenciaUrls || [];
        break;
      case 'CONTENIDOS':
        this.imagenes = mantenimiento.mantenimientoContenidosSistemaCableEvidenciaUrls || [];
        break;
      case 'INTERNET':
        this.imagenes = mantenimiento.mantenimientoInternetEvidenciaUrls || [];
        break;
      case 'CCTV':
        this.imagenes = mantenimiento.mantenimientoCCTVEvidenciaUrls || [];
        break;
      case 'NO BRAKES':
        this.imagenes = mantenimiento.mantenimientoNoBrakesEvidenciaUrls || [];
        break;
      case 'TIEMPOS COCINA':
        this.imagenes = mantenimiento.mantenimientoTiemposCocinaEvidenciaUrls || [];
        break;
      case 'APPS':
        this.imagenes = mantenimiento.mantenimientoConcentradorAppsEvidenciaUrls || [];
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

  verificarChatNoLeido(mantenimiento: Mantenimiento10x10) {
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

      case 'CAJA':
        this.mantenimientoSeleccionado.mantenimientoCajaEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoCajaEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'IMPRESORAS':
        this.mantenimientoSeleccionado.mantenimientoImpresorasEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoImpresorasEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'RACK':
        this.mantenimientoSeleccionado.mantenimientoRackEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoRackEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'TPV':
        this.mantenimientoSeleccionado.mantenimientoPuntosVentaTabletasEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoPuntosVentaTabletasEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'CONTENIDOS':
        this.mantenimientoSeleccionado.mantenimientoContenidosSistemaCableEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoContenidosSistemaCableEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'INTERNET':
        this.mantenimientoSeleccionado.mantenimientoInternetEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoInternetEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'CCTV':
        this.mantenimientoSeleccionado.mantenimientoCCTVEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoCCTVEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'NO BRAKES':
        this.mantenimientoSeleccionado.mantenimientoNoBrakesEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoNoBrakesEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'TIEMPOS COCINA':
        this.mantenimientoSeleccionado.mantenimientoTiemposCocinaEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoTiemposCocinaEvidenciaUrls || []).filter(u => u !== url);
        break;

      case 'APPS':
        this.mantenimientoSeleccionado.mantenimientoConcentradorAppsEvidenciaUrls =
          (this.mantenimientoSeleccionado.mantenimientoConcentradorAppsEvidenciaUrls || []).filter(u => u !== url);
        break;
    }

    await this.maintenance10x10Service.update(this.mantenimientoSeleccionado.id, this.mantenimientoSeleccionado);
  }
}
