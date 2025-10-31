import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

import { VersionControlService } from '../../services/version-control.service';
import { ControlVersion } from '../../models/control-version.model';
import { VersionUsuario } from '../../models/version-usuario.model';
import { Usuario } from '../../models/usuario.model';
import { VersionUsuarioService } from '../../services/version-usuario.service';
import { DatesHelperService } from '../../helpers/dates-helper.service';
import { ModalVersionEditComponent } from '../admin/dialogs/modal-version-edit/modal-version-edit.component';

@Component({
  selector: 'app-versions-history',
  standalone: true,
  imports: [TableModule, CommonModule, ModalVersionEditComponent],
  templateUrl: './versions-history.component.html',
  styleUrl: './versions-history.component.scss',
})

export default class VersionsHistoryComponent {
  versionActual: ControlVersion | any;
  versiones: ControlVersion[] = [];
  versionSeleccionada: any;
  usuario: Usuario | any = null;
  private versionSubscription: Subscription | undefined;

  mostrarModalEditar: boolean = false;

  constructor(
    private versionControlService: VersionControlService,
    private versionUsuarioService: VersionUsuarioService,
    private cdr: ChangeDetectorRef,
    public datesHelper: DatesHelperService
  ) { }

  async ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);

    this.versionSubscription = this.versionControlService
      .getLastVersion()
      .subscribe((result) => {
        if (result.length > 0) this.versionActual = { ...result[0] };
        this.guardarVersionUsuario();
      });

    this.versionControlService.get().subscribe((result) => {
      this.versiones = result;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.versionSubscription) {
      this.versionSubscription.unsubscribe();
    }
  }

  async guardarVersionUsuario() {
    const nuevoRegistro: VersionUsuario = new VersionUsuario();
    nuevoRegistro.idUsuario = this.usuario.id;
    nuevoRegistro.idVersion = this.versionActual.id;
    await this.versionUsuarioService.updateUserVersion({ ...nuevoRegistro });
  }

  abrirModalEditar(version: ControlVersion) {
    console.log('Versión clickeada:', version);
    this.mostrarModalEditar = true;
    this.versionSeleccionada = version;
  }
}
