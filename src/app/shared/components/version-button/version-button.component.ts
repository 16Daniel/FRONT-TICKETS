import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { VersionControlService } from '../../../versiones/services/version-control.service';
import { VersionUsuarioService } from '../../../versiones/services/version-usuario.service';
import { ControlVersion } from '../../../versiones/interfaces/control-version.model';

@Component({
  selector: 'app-version-button',
  standalone: true,
  imports: [ButtonModule, CommonModule, RouterModule],
  templateUrl: './version-button.component.html',
  styleUrl: './version-button.component.scss',
})

export class VersionButtonComponent implements OnInit {
  versionActual: ControlVersion | any;
  versionUsuario: ControlVersion | any;
  usuario: Usuario | any = null;
  mostrarNotificacion: boolean = false;

  constructor(
    private versionControlService: VersionControlService,
    private cdr: ChangeDetectorRef,
    private versionUsuarioService: VersionUsuarioService
  ) {}
  async ngOnInit(): Promise<void> {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);

    this.versionControlService.getLastVersion().subscribe((result) => {
      if (result.length > 0) this.versionActual = { ...result[0] };
      this.cdr.detectChanges();

      if (this.versionUsuario?.idVersion == this.versionActual.id) {
        this.mostrarNotificacion = false;
      } else {
        this.mostrarNotificacion = true;
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
          this.mostrarNotificacion = true;
        }
        this.cdr.detectChanges();
      });
  }
}
