import { ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import Swal from 'sweetalert2';

import { ModalFinalCommentsComponent } from '../../dialogs/modal-final-comments/modal-final-comments.component';
import { ModalSysMttoImguploaderComponent } from '../../dialogs/systems/modal-sys-mtto-imguploader/modal-sys-mtto-imguploader.component';
import { ModalVisorVariasImagenesComponent } from '../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { ModalMaintenanceChatComponent } from '../../dialogs/modal-maintenance-chat/modal-maintenance-chat.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { MantenimientosSistemasService } from '../../services/mantenimientos-sistemas.service';
import { MantenimientoSys } from '../../interfaces/mantenimiento-sys.interface';
import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';

@Component({
  selector: 'app-tabla-mantenimientos-sistemas',
  styleUrl: './tabla-mantenimientos-sistemas.component.scss',
  templateUrl: './tabla-mantenimientos-sistemas.component.html',
  standalone: true,
  imports: [
    TableModule,
    TooltipModule,
    CommonModule,
    ModalFinalCommentsComponent,
    ModalSysMttoImguploaderComponent,
    ModalVisorVariasImagenesComponent,
    ModalMaintenanceChatComponent
  ],
})
export class TablaMantenimientosSistemasComponent {
  @Input() mantenimientos: MantenimientoSys[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Input() idSucursal?: string;
  @Input() mostrarChat: boolean = false;
  @Output() clickEvent = new EventEmitter<MantenimientoSys>();

  mantenimientoSeleccionado: MantenimientoSys | undefined;
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
    public mantenimientosSistemasService: MantenimientosSistemasService,
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
    const urls = this.obtenerImagenesPorCampo(mantenimiento, campo);

    if (this.usuario?.idRol === '4') {
      Swal.fire({
        title: `EVIDENCIA: ${campo}`,
        text: urls.length > 0 ? `Hay ${urls.length} foto(s) de evidencia.` : 'No hay fotos registradas aún.',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'VER IMÁGENES',
        denyButtonText: 'SUBIR IMAGEN',
        cancelButtonText: 'CANCELAR',
        confirmButtonColor: '#d3152a',
        denyButtonColor: '#0f172a',
      }).then((result) => {
        if (result.isConfirmed) {
          if (urls.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Sin imágenes',
              text: `No hay evidencias fotográficas registradas en ${campo}.`,
              confirmButtonColor: '#d3152a',
            });
            return;
          }
          this.abrirModalVisorImagen(mantenimiento, campo);
          this.cdr.detectChanges();
        } else if (result.isDenied) {
          this.mostrarModalSubirImagen = true;
          this.cdr.detectChanges();
        }
      });
    } else {
      if (urls.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin imágenes',
          text: `No hay evidencias fotográficas registradas en ${campo}.`,
          confirmButtonColor: '#d3152a',
        });
        return;
      }
      this.abrirModalVisorImagen(mantenimiento, campo);
    }
  }

  obtenerImagenesPorCampo(mantenimiento: MantenimientoSys, campo: string): string[] {
    if (!mantenimiento) return [];
    switch (campo) {
      case 'CAJA':
        return mantenimiento.mantenimientoCajaEvidenciaUrls || [];
      case 'IMPRESORAS':
        return mantenimiento.mantenimientoImpresorasEvidenciaUrls || [];
      case 'RACK':
        return mantenimiento.mantenimientoRackEvidenciaUrls || [];
      case 'TPV':
        return mantenimiento.mantenimientoPuntosVentaTabletasEvidenciaUrls || [];
      case 'INTERNET':
        return mantenimiento.mantenimientoInternetEvidenciaUrls || [];
      case 'CCTV':
        return mantenimiento.mantenimientoCCTVEvidenciaUrls || [];
      case 'NO BRAKES':
        return mantenimiento.mantenimientoNoBrakesEvidenciaUrls || [];
      case 'TIEMPOS COCINA':
        return mantenimiento.mantenimientoTiemposCocinaEvidenciaUrls || [];
      default:
        return [];
    }
  }

  obtenerTooltipEvidencia(urls?: string[]): string {
    const total = urls ? urls.length : 0;
    if (total === 1) {
      return '1 foto de evidencia adjunta • Clic para ver';
    } else if (total > 1) {
      return `${total} fotos de evidencia adjuntas • Clic para ver`;
    }
    return this.usuario?.idRol === '4'
      ? 'Sin fotos de evidencia • Clic para subir'
      : 'Sin fotos de evidencia adjuntas';
  }

  abrirModalVisorImagen(mantenimiento: MantenimientoSys, campo: string) {
    this.tituloVisor = campo;
    this.imagenes = this.obtenerImagenesPorCampo(mantenimiento, campo);
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

  verificarChatNoLeido(mantenimiento: MantenimientoSys) {
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


    }

    await this.mantenimientosSistemasService.update(this.mantenimientoSeleccionado.id, this.mantenimientoSeleccionado);
  }
}
