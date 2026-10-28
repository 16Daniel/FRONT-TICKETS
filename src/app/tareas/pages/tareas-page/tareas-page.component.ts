import { Component, ChangeDetectorRef, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardTasksPageComponent } from '../dashboard-tasks-page/dashboard-tasks-page';
import { EisenhowerMatrixPageComponent } from '../eisenhower-matrix-page/eisenhower-matrix-page';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';

@Component({
  selector: 'app-tareas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardTasksPageComponent, EisenhowerMatrixPageComponent],
  template: `
    <div class="p-4">
      <div class="d-flex align-items-center mb-4">
        <h2 class="m-0">TAREAS</h2>
        <div class="d-flex align-items-center gap-3 ms-auto">
          <label class="form-check-label fs-4 mb-0" for="activarGuardia">
            EISENHOWER
          </label>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="activarGuardia"
              style="width: 3rem; height: 2rem;" [(ngModel)]="verEisenhower" (change)="onToggleEisenhower()">
          </div>
        </div>
      </div>
      
      <app-dashboard-tasks-page [hidden]="verEisenhower || !sucursal || sucursal.id == undefined"></app-dashboard-tasks-page>
      <app-eisenhower-matrix-page [hidden]="!verEisenhower || !sucursal || sucursal.id == undefined"></app-eisenhower-matrix-page>
    </div>
  `
})
export class TareasPageComponent implements OnInit {
  verEisenhower: boolean = false;
  usuario: Usuario;
  sucursal: Sucursal;

  constructor(private cdr: ChangeDetectorRef) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario?.sucursales?.[0];
  }

  ngOnInit() {}

  onToggleEisenhower() {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }
}
