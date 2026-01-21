import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { VersionUsuarioService } from '../../../versiones/services/version-usuario.service';
import { VersionControlService } from '../../../versiones/services/version-control.service';
import { ControlVersion } from '../../../versiones/interfaces/control-version.model';
import { VersionUsuario } from '../../../versiones/interfaces/version-usuario.model';

@Component({
  selector: 'app-update-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './update-banner.component.html',
  styleUrl: './update-banner.component.scss'
})

export class UpdateBannerComponent implements OnInit {
  paginaCargaPrimeraVez1: boolean = true;
  paginaCargaPrimeraVez2: boolean = true;
  usuario: Usuario;
  versionActual: ControlVersion | any;
  versionUsuario: ControlVersion | any;
  mostrarNotificacion: boolean = false;

  constructor(
    private versionUsuarioService: VersionUsuarioService,
    private versionControlService: VersionControlService,
    private cdr: ChangeDetectorRef,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  async ngOnInit(): Promise<void> {
    this.versionControlService.getLastVersion().subscribe((result) => {
      if (result.length > 0) this.versionActual = { ...result[0] };
      this.cdr.detectChanges();

      if (this.versionUsuario?.idVersion == this.versionActual.id) {
        this.mostrarNotificacion = false;
      } else {
        this.mostrarNotificacion = this.paginaCargaPrimeraVez1 ? false : true;
        if (this.mostrarNotificacion)
          this.mostrarAlerta();
        this.paginaCargaPrimeraVez1 = false;
      }
      this.cdr.detectChanges();
    });

    this.versionUsuarioService
      .getLastVersionByUser(this.usuario.id)
      .subscribe((result) => {
        if (result.length > 0) this.versionUsuario = { ...result[0] };
        if (this.versionUsuario?.idVersion == this.versionActual.id) {
          this.mostrarNotificacion = false;
        } else {
          this.mostrarNotificacion = this.paginaCargaPrimeraVez2 ? false : true;
          if (this.mostrarNotificacion)
            this.mostrarAlerta();
          this.paginaCargaPrimeraVez2 = false;
        }
        this.cdr.detectChanges();
      });
  }

  mostrarAlerta() {
    let fecha: Date;
    if ((this.versionActual.fecha as any)?.toDate) {
      fecha = (this.versionActual.fecha as any).toDate();
    } else {
      fecha = new Date(this.versionActual.fecha);
    }

    const fechaFormateada = fecha.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    Swal.fire({
      title: `<span style="color:red; font-weight:bold;">🚨 NUEVA VERSIÓN 🚨</span><br/>Versión ${this.versionActual.version}`,
      html: `
        <div style="text-align:left;">
          <p><b>Fecha:</b><br/> ${fechaFormateada}</p>
          <p><b>Descripción:</b><br/> ${this.versionActual.descripcion}</p>
        </div>
        <style>
          .swal2-html-container img {
            max-width: 100% !important;
            height: auto !important;
          }
        </style>
      `,
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Actualizar ahora',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.guardarVersionUsuario();
        location.reload();
      }
    });
  }

  async guardarVersionUsuario() {
    const nuevoRegistro: VersionUsuario = new VersionUsuario();
    nuevoRegistro.idUsuario = this.usuario.id;
    nuevoRegistro.idVersion = this.versionActual.id;
    await this.versionUsuarioService.updateUserVersion({ ...nuevoRegistro });
  }
}
