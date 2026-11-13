import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ViaticosTabComponent } from '../../components/viaticos-tab/viaticos-tab.component';
import { BonosTabComponent } from '../../components/bonos-tab/bonos-tab.component';
import { FondeoTarjetaTabComponent } from '../../components/fondeo-tarjeta-tab/fondeo-tarjeta-tab.component';
import { GasolinaTabComponent } from '../../components/gasolina-tab/gasolina-tab.component';
import ShoppingAdminPageComponent from '../shopping-admin-page/shopping-admin-page.component';

type TabRequisicionId = 'COMPRAS' | 'VIATICO' | 'BONO' | 'FONDEO' | 'GASOLINA';

interface OpcionTabRequisicion {
  id: TabRequisicionId;
  label: string;
  icono: string;
}

@Component({
  selector: 'app-requisicion-compras-page',
  standalone: true,
  imports: [
    CommonModule,
    SideMenuComponent,
    PageHeaderComponent,
    ShoppingAdminPageComponent,
    ViaticosTabComponent,
    BonosTabComponent,
    FondeoTarjetaTabComponent,
    GasolinaTabComponent,
  ],
  templateUrl: './requisicion-compras-page.component.html',
  styleUrl: './requisicion-compras-page.component.scss',
})
export default class RequisicionComprasPageComponent {
  tabsDisponibles: OpcionTabRequisicion[] = [
    { id: 'COMPRAS', label: 'COMPRAS', icono: 'bx bx-cart' },
    { id: 'VIATICO', label: 'VIÁTICO', icono: 'bx bx-briefcase-alt-2' },
    { id: 'BONO', label: 'BONO', icono: 'bx bx-gift' },
    { id: 'FONDEO', label: 'FONDEO TARJETA', icono: 'bx bx-credit-card' },
    { id: 'GASOLINA', label: 'GASOLINA', icono: 'bx bx-gas-pump' },
  ];

  tabActivo: TabRequisicionId = 'COMPRAS';

  cambiarTab(tab: TabRequisicionId): void {
    this.tabActivo = tab;
  }
}
