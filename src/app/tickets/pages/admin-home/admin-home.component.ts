import { Component } from '@angular/core';
import { AdminTabsComponent } from '../../components/admin-tabs/admin-tabs.component';
import { NotificacionNuevoMensajeChatComponent } from '../../../../components/notificacion-nuevo-mensaje-chat/notificacion-nuevo-mensaje-chat.component';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    AdminTabsComponent,
    NotificacionNuevoMensajeChatComponent
  ],
  templateUrl: './admin-home.component.html',
})

export default class AdminHomeComponent {
}
