import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { Subscription } from 'rxjs';

import { AdminSysTabComponent } from '../../../mantenimientos/components/admin-sys-tab/admin-sys-tab.component';
import { AdminAudioVideoTabComponent } from '../../../mantenimientos/components/admin-audio-video-tab/admin-audio-video-tab.component';
import { AdminMaintenanceTabComponent } from '../../../mantenimientos/components/admin-maintenance-tab/admin-maintenance-tab.component';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Ticket } from '../../models/ticket.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { DashboardTasksPage } from '../../../tareas/pages/dashboard-tasks-page/dashboard-tasks-page';
import { EisenhowerMatrixPage } from '../../../tareas/pages/eisenhower-matrix-page/eisenhower-matrix-page';
import AdminReportsTabComponent from '../../../aceite/pages/admin-reports-tab/admin-reports-tab.component';

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  imports: [
    FormsModule,
    TabViewModule,
    CommonModule,
    AdminSysTabComponent,
    AdminAudioVideoTabComponent,
    AdminMaintenanceTabComponent,
    AdminReportsTabComponent,
    EisenhowerMatrixPage,
    DashboardTasksPage,
    DropdownModule
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
  verEisenhower: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];

    this.activeIndex = 0;
    if (this.usuario.idArea == '1')
      this.tabsActivos['SISTEMAS'] = true;
    if (this.usuario.idArea == '2')
      this.tabsActivos['AUDIO Y VIDEO'] = true;
    if (this.usuario.idArea == '4')
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

  onToggleEisenhower() {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }
}
