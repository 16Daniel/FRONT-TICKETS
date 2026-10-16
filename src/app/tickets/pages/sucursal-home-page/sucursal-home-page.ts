import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { SucursalesTabsComponent } from '../../components/sucursales-tabs/sucursales-tabs.component';
import { NotificacionNuevoMensajeChatComponent } from '../../components/notificacion-nuevo-mensaje-chat/notificacion-nuevo-mensaje-chat.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-sucursal-home-page',
  standalone: true,
  imports: [
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    SucursalesTabsComponent,
    PageHeaderComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sucursal-home-page.html',
  styleUrl: './sucursal-home-page.scss'
})
export default class SucursalHomePageComponent {
  esEspectadorActivo: boolean = false;

  constructor() { }

  activarEspectador(activar: boolean) {
    this.esEspectadorActivo = activar;
  }
}
