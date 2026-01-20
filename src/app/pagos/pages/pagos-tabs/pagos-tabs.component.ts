import { Component, type OnInit } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { CommonModule } from '@angular/common';

import ShoppingAdminComponent from '../shopping-admin/shopping-admin.component';
import { ViaticosTabComponent } from "./tabs/viaticos-tab/viaticos-tab.component";
import { BonosTabComponent } from "./tabs/bonos-tab/bonos-tab.component";
import { FondeoTarjetaTabComponent } from "./tabs/fondeo-tarjeta-tab/fondeo-tarjeta-tab.component";
import { GasolinaTabComponent } from "./tabs/gasolina-tab/gasolina-tab.component";
import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';

@Component({
  selector: 'app-pagos-tabs',
  standalone: true,
  imports: [
    SideMenuComponent,
    CommonModule,
    TabViewModule,
    ShoppingAdminComponent,
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
