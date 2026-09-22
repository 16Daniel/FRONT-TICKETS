import { Component, ChangeDetectorRef, type OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardTasksPageComponent } from '../dashboard-tasks-page/dashboard-tasks-page';
import { EisenhowerMatrixPageComponent } from '../eisenhower-matrix-page/eisenhower-matrix-page';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';

import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';

@Component({
  selector: 'app-tareas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardTasksPageComponent, EisenhowerMatrixPageComponent, AvatarModule, TooltipModule],
  templateUrl: './tareas-page.component.html',
  styleUrl: './tareas-page.component.scss'
})
export class TareasPageComponent implements OnInit, OnDestroy {
  verEisenhower: boolean = false;
  usuario: Usuario;
  sucursal: Sucursal;
  responsableTarea: ResponsableTarea | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario?.sucursales?.[0];
    const respStr = localStorage.getItem('responsable-tareas');
    this.responsableTarea = respStr ? JSON.parse(respStr) : null;
  }

  ngOnInit() {}

  ngOnDestroy() {
    debugger
    localStorage.removeItem('responsable-tareas');
  }

  onToggleEisenhower() {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }
}
