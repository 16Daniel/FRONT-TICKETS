import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { VersionControlService } from '../../services/version-control.service';
import { ControlVersion } from '../../models/control-version.model';

@Component({
  selector: 'app-version-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './version-button.component.html',
  styleUrl: './version-button.component.scss',
})
export class VersionButtonComponent implements OnInit {
  public version: ControlVersion | any;

  constructor(private versionControlService: VersionControlService,     private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.versionControlService.getLastVersion().then((result) => {
      this.version = { ...result };
      this.cdr.detectChanges();

      console.log(this.version.version);
    });
  }
}
