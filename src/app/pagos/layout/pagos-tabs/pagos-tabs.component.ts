import { Component, type OnInit } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { CommonModule } from '@angular/common';

import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { ViaticosTabComponent } from '../../components/viaticos-tab/viaticos-tab.component';
import { BonosTabComponent } from '../../components/bonos-tab/bonos-tab.component';
import { FondeoTarjetaTabComponent } from '../../components/fondeo-tarjeta-tab/fondeo-tarjeta-tab.component';
import { GasolinaTabComponent } from '../../components/gasolina-tab/gasolina-tab.component';
import ShoppingAdminPageComponent from '../../pages/shopping-admin-page/shopping-admin-page.component';

@Component({
  selector: 'app-pagos-tabs',
  standalone: true,
  imports: [
    SideMenuComponent,
    CommonModule,
    TabViewModule,
    ShoppingAdminPageComponent,
    ViaticosTabComponent,
    BonosTabComponent,
    FondeoTarjetaTabComponent,
    GasolinaTabComponent
  ],
  templateUrl: './pagos-tabs.component.html',
  styleUrl: './pagos-tabs.component.scss',
})
export default class PagosTabsComponent implements OnInit {

  ngOnInit(): void { }

}
