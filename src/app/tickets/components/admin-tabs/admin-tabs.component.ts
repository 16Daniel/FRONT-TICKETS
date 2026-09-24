import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
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
    FormsModule,
    TabViewModule,
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
  
  activeIndex: number = 0;
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

  onTabChange(event: any) {
    const header = event.originalEvent.target.innerText.trim();
    this.activeIndex = event.index;
    this.tabsActivos[header] = true;
  }
}
