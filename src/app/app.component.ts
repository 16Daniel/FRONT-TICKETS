import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FcmService } from './alertas/service/fcm.service';
import { PwaInstallBannerComponent } from './shared/components/pwa-install-banner/pwa-install-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PwaInstallBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'WEB-PLANEACION';
  private fcmService = inject(FcmService);

  ngOnInit() {
    this.requestPermission();
    this.fcmService.listenMessages().subscribe();
  }

  requestPermission() {
    this.fcmService.requestPermission();
  }
}
