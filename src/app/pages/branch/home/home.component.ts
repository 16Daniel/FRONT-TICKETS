import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { BranchesTabsComponent } from '../../../components/tickets/branches-tabs/branches-tabs.component';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    BranchesTabsComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.component.html',
})
export default class HomeComponent {
  constructor(private mantenimientoService: Maintenance10x10Service) {
    // this.nuevoMantenimiento()
  }

  async nuevoMantenimiento() {
    const mantenimiento: Mantenimiento10x10 = {
      idSucursal: '41',
      idUsuarioSoporte: "JhPZN7fQD1REyldGXop17qR8Now1",
      fecha: new Date(),
      estatus: true,
      mantenimientoCaja: false,
      mantenimientoCCTV: false,
      mantenimientoConcentradorApps: false,
      mantenimientoContenidosSistemaCable: false,
      mantenimientoImpresoras: false,
      mantenimientoInternet: false,
      mantenimientoNoBrakes: false,
      mantenimientoPuntosVentaTabletas: false,
      mantenimientoRack: false,
      mantenimientoTiemposCocina: false,
      observaciones: '',
    };

    await this.mantenimientoService.create(mantenimiento);
    console.log('ok');
  }
}
