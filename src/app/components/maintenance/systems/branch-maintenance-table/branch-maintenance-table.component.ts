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
import { ModalVisorImagenesComponent } from '../../../../modals/modal-visor-imagenes/modal-visor-imagenes.component';
import { ModalMaintenanceChatComponent } from '../../../../modals/maintenance/modal-maintenance-chat/modal-maintenance-chat.component';
import { MantenimientoFactoryService } from '../../../../services/maintenance-factory.service';

@Component({
  selector: 'app-branch-maintenance-table',
  styleUrl: './branch-maintenance-table.component.scss',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ModalFinalCommentsComponent,
    ModalSysMttoImguploaderComponent,
    ModalVisorImagenesComponent,
    ModalMaintenanceChatComponent
  ],
  templateUrl: './branch-maintenance-table.component.html',
})
export class BranchMaintenanceTableComponent {
  @Input() mantenimientos: Mantenimiento10x10[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Input() idSucursal?: string;
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

  constructor(
    public dateHelpder: DatesHelperService,
    private cdr: ChangeDetectorRef,
    public maintenance10x10Service: Maintenance10x10Service,
    private mantenimientoFactory: MantenimientoFactoryService,
    private datesHelper: DatesHelperService
  ) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  ngOnChanges(changes: SimpleChanges) {
    this.observaActualizacionesChatTicket(changes);
  }

  observaActualizacionesChatTicket(changes: SimpleChanges) {
    if (changes['mantenimientos'] && changes['mantenimientos'].currentValue) {
      // this.obtenerMantenimientos(this.idSucursal!);
      console.log('Mantenimientos actualizados');

      // this.mantenimientos.forEach(element => {
      //   if (!element.comentarios)
      //     element.comentarios = []

      //   console.log(element.id, element.comentarios.length)
      //   this.cdr.detectChanges();
      // });
    }
  }

  obtenerMantenimientos(idsSucursal: string) {
    const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);

    servicio
      .getUltimosMantenimientos([...idsSucursal])
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

        this.mantenimientos.forEach(element => {
          
          console.log(element.id, element.comentarios.length)
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

  onClickChat(mantenimiento: any) {
    this.mantenimientoSeleccionado = mantenimiento;
    this.mostrarModalChat = true;
  }

  verificarChatNoLeido(mantenimiento: Mantenimiento10x10) {
    if (!mantenimiento.participantesChat)
      mantenimiento.participantesChat = [];

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
}
