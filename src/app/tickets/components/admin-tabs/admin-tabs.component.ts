import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { Usuario } from '../../../usuarios/models/usuario.model';
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
    this.sucursal = this.usuario?.idSucursal
      ? ({ id: String(this.usuario.idSucursal), nombre: '' } as Sucursal)
      : new Sucursal();
  }

  ngOnInit() {
    this.areasSub = this.areasService.areas$.subscribe((areas) => {
      let filteredAreas = areas.filter(a => a.activarTickets === true && !a.eliminado);
      const idRol = String(this.usuario?.idRol || '');
      const esDireccion = idRol === '9';
      const puedeVerTodasLasAreas = idRol === '1' || esDireccion;

      if (!puedeVerTodasLasAreas) {
        filteredAreas = filteredAreas.filter(a => String(a.id) === String(this.usuario.idArea));
      }

      if (esDireccion) {
        const tabGlobal: Area = {
          id: '0',
          nombre: 'Global',
          activarTickets: true,
          eliminado: false,
        } as Area;
        filteredAreas = [tabGlobal, ...filteredAreas];
      }

      this.areasTicket = filteredAreas;
      
      if (this.areasTicket.length > 0) {
        const seleccionSigueValida = this.areasTicket.some(
          a => String(a.id) === String(this.areaSeleccionadaId)
        );
        if (!seleccionSigueValida) {
          this.areaSeleccionadaId = this.areasTicket[0].id;
        }
        const areaActiva = this.areasTicket.find(
          a => String(a.id) === String(this.areaSeleccionadaId)
        ) || this.areasTicket[0];
        this.tabsActivos[String(areaActiva.id)] = true;
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
    this.tabsActivos[String(area.id)] = true;
  }
}
