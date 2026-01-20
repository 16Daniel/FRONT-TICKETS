import { ChangeDetectorRef, Component } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TicketsTabComponent } from '../tickets-tab/tickets-tab.component';
import { DashboardTasksComponent } from '../../../tareas/components/dashboard-tasks/dashboard-tasks.component';
import { EisenhowerMatrixComponent } from '../../../tareas/components/eisenhower-matrix.component/eisenhower-matrix.component';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';

@Component({
  selector: 'app-analyst-tabs',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TabViewModule,
    DashboardTasksComponent,
    EisenhowerMatrixComponent,
    TicketsTabComponent
  ],
  templateUrl: './analyst-tabs.component.html',
  styleUrl: './analyst-tabs.component.scss'
})
export class AnalystTabsComponent {
  public tabindex: number = 0;
  verEisenhower: boolean = false;
  sucursal: Sucursal;
  usuario: Usuario;

  constructor(public cdr: ChangeDetectorRef,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
  }

  onToggleEisenhower() {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }
}
