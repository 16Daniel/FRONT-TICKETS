import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install-banner.component.html',
  styleUrl: './pwa-install-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PwaInstallBannerComponent {
  public readonly pwaService = inject(PwaService);
  private readonly cdr = inject(ChangeDetectorRef);

  public logoUrl: string = 'assets/images/Logo_REBEL_Vertical_1024x1024.PNG';

  public onLogoError(): void {
    if (this.logoUrl !== '/front/tickets/assets/images/Logo_REBEL_Vertical_1024x1024.PNG') {
      this.logoUrl = '/front/tickets/assets/images/Logo_REBEL_Vertical_1024x1024.PNG';
      this.cdr.markForCheck();
    }
  }

  public instalar(): void {
    this.pwaService.instalarApp(this.logoUrl);
  }

  public cerrar(): void {
    this.pwaService.descartarBannerInstalacion();
  }
}
