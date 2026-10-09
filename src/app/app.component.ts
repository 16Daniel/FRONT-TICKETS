import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FcmService } from './alertas/service/fcm.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'WEB-PLANEACION';
private fcmService = inject(FcmService);

  ngOnInit() {
    this.requestPermission();
    this.fcmService.listenMessages().subscribe((message) => {
      alert(`Notificación: ${message.notification.title}\n${message.notification.body}`);
    });
  }

  requestPermission() {
    this.fcmService.requestPermission();
  }


}
