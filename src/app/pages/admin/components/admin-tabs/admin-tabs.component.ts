import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { Subscription } from 'rxjs';

import { Sucursal } from '../../../../models/sucursal.model';
import { Usuario } from '../../../../models/usuario.model';
import { Ticket } from '../../../../models/ticket.model';
import { AdminSysTabComponent } from "../admin-sys-tab/admin-sys-tab.component";
import { AdminAudioVideoTabComponent } from "../admin-audio-video-tab/admin-audio-video-tab.component";
import { AdminMaintenanceTabComponent } from '../admin-maintenance-tab/admin-maintenance-tab.component';
import AdminReportsTabComponent from '../admin-reports-tab/admin-reports-tab.component';
import { DashboardTasksComponent } from '../../../../components/tasks/dashboard-tasks/dashboard-tasks.component';
import { EisenhowerMatrixComponent } from '../../../../components/tasks/eisenhower-matrix.component/eisenhower-matrix.component';
import { DropdownModule } from 'primeng/dropdown';
import { BranchesService } from '../../../../services/branches.service';

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
    EisenhowerMatrixComponent,
    DashboardTasksComponent,
    DropdownModule
  ],
  templateUrl: './admin-tabs.component.html',
})

export class AdminTabsComponent {
  sucursales: Sucursal[] = [];
  idSucursalSeleccionada: string = '';
  mostrarComponentes: boolean = true;

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

  constructor(private cdr: ChangeDetectorRef, private branchesService: BranchesService) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
    this.idSucursalSeleccionada = this.usuario.sucursales[0].id;

    this.obtenerSucursales();

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

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => { },
    });
  }


  onSucursalChange() {

    this.mostrarComponentes = false;

    setTimeout(() => {
      this.mostrarComponentes = true;
      this.cdr.detectChanges();

    }, 500);
  }
}
