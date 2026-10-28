import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { AdminAreaTabComponent } from '../admin-area-tab/admin-area-tab.component';
import { AreasService } from '../../../areas/services/areas.service';
import { Area } from '../../../areas/interfaces/area.model';

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  imports: [
    CommonModule,
    AdminAreaTabComponent
  ],
  templateUrl: './admin-tabs.component.html',
  styleUrl: './admin-tabs.component.scss',
})
export class AdminTabsComponent implements OnInit, OnDestroy {
  sucursal: Sucursal;
  usuario: Usuario;
  areasTicket: Area[] = [];
  areasSub: Subscription | undefined;
  
  areaSeleccionadaId: any;
  tabsActivos: Record<string, boolean> = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private areasService: AreasService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
  }

  ngOnInit() {
    this.areasSub = this.areasService.areas$.subscribe((areas) => {
      let filteredAreas = areas.filter(a => a.activarTickets === true);

      if (this.usuario.idRol !== '1') {
        filteredAreas = filteredAreas.filter(a => a.id === this.usuario.idArea);
      }

      this.areasTicket = filteredAreas;
      
      if (this.areasTicket.length > 0) {
        this.areaSeleccionadaId = this.areasTicket[0].id;
        this.tabsActivos[this.areasTicket[0].nombre] = true;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.areasSub) {
      this.areasSub.unsubscribe();
    }
  }

  cambiarArea(area: Area) {
    this.areaSeleccionadaId = area.id;
    this.tabsActivos[area.nombre] = true;
  }
}
