import { ChangeDetectorRef, Component } from '@angular/core';
import { VersionControlService } from '../../services/version-control.service';
import { ControlVersion } from '../../models/control-version.model';
import { TableModule } from 'primeng/table';

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

  constructor(
    private versionControlService: VersionControlService,
    private cdr: ChangeDetectorRef
  ) {}
  
  async ngOnInit(): Promise<void> {
    await this.versionControlService.getLastVersion().then((result) => {
      this.versionActual = { ...result };
      console.log(this.versionActual);
    });

    await this.versionControlService.get().subscribe((result) => {
      this.versiones = result;
      this.cdr.detectChanges();

      console.log(this.versiones);
    });
  }

  onClick() {}
}
