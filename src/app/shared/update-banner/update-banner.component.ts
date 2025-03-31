import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VersionUsuarioService } from '../../services/version-usuario.service';
import { Usuario } from '../../models/usuario.model';
import { ControlVersion } from '../../models/control-version.model';
import { VersionControlService } from '../../services/version-control.service';

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
          this.paginaCargaPrimeraVez2 = false;        }
        this.cdr.detectChanges();
      });
  }
}
