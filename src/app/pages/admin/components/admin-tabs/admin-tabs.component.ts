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
  tabsActivos: boolean[] = [true, false, false, false];

  private unsubscribe!: () => void;

  constructor(private cdr: ChangeDetectorRef) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
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
    const index = event.index;
    this.activeIndex = index;
    this.tabsActivos[index] = true;
  }

}
