import { ChangeDetectorRef, Component } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { Subscription } from 'rxjs';

import { Sucursal } from '../../../../models/sucursal.model';
import { Usuario } from '../../../../models/usuario.model';
import { Ticket } from '../../../../models/ticket.model';
import { AdminSysTabComponent } from "../admin-sys-tab/admin-sys-tab.component";
import { AdminAudioVideoTabComponent } from "../admin-audio-video-tab/admin-audio-video-tab.component";
import { AdminMaintenanceTabComponent } from '../admin-maintenance-tab/admin-maintenance-tab.component';
import AdminReportsTabComponent from '../admin-reports-tab/admin-reports-tab.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  imports: [
    TabViewModule,
    CommonModule,
    AdminSysTabComponent,
    AdminAudioVideoTabComponent,
    AdminMaintenanceTabComponent,
    AdminReportsTabComponent
  ],
  templateUrl: './admin-tabs.component.html',
})

export class AdminTabsComponent {
  sucursal: Sucursal;
  usuario: Usuario;
  subscripcionTicket: Subscription | undefined;
  loading: boolean = false;
  tickets: Ticket[] = [];
  public todosLostickets: Ticket[] = [];
  ticket: Ticket | undefined;

  activeIndex: number = 0;
  tabsActivos: Record<string, boolean> = {};
  private unsubscribe!: () => void;

  constructor(private cdr: ChangeDetectorRef) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    this.activeIndex = 0;
    if(this.usuario.idArea == '1')
      this.tabsActivos['SISTEMAS'] = true;
    if(this.usuario.idArea == '2')
      this.tabsActivos['AUDIO Y VIDEO'] = true;
    if(this.usuario.idArea == '4')
      this.tabsActivos['MANTENIMIENTO'] = true;
  }

  ngOnDestroy() {
    if (this.subscripcionTicket != undefined) {
      this.subscripcionTicket.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  refrescar() {
    this.cdr.detectChanges();
  }

  onTabChange(event: any) {
    const header = event.originalEvent.target.innerText.trim();
    this.activeIndex = event.index;
    this.tabsActivos[header] = true;
  }
}
