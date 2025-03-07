import { ChangeDetectorRef, Component } from '@angular/core';
import { VersionControlService } from '../../services/version-control.service';
import { ControlVersion } from '../../models/control-version.model';
import { TableModule } from 'primeng/table';
import { Timestamp } from '@firebase/firestore';
import { VersionUsuario } from '../../models/version-usuario.model';
import { Usuario } from '../../models/usuario.model';
import { VersionUsuarioService } from '../../services/version-usuario.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-versions-history',
  standalone: true,
  imports: [TableModule],
  templateUrl: './versions-history.component.html',
  styleUrl: './versions-history.component.scss',
})
export default class VersionsHistoryComponent {
  versionActual: ControlVersion | any;
  versiones: ControlVersion[] = [];
  versionSeleccionada: any;
  usuario: Usuario | any = null;
  private versionSubscription: Subscription | undefined;

  constructor(
    private versionControlService: VersionControlService,
    private versionUsuarioService: VersionUsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

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
    // Desuscribirse para evitar fugas de memoria
    if (this.versionSubscription) {
      this.versionSubscription.unsubscribe();
    }
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    } catch {
      return tsmp;
    }
  }

  async guardarVersionUsuario() {
    const nuevoRegistro: VersionUsuario = new VersionUsuario();
    nuevoRegistro.idUsuario = this.usuario.id;
    nuevoRegistro.idVersion = this.versionActual.id;
    await this.versionUsuarioService.updateUserVersion({ ...nuevoRegistro });
  }
}
