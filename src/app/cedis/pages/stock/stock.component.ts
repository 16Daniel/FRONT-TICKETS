import { Component, type OnInit } from '@angular/core';
import { MenubarModule } from "primeng/menubar";
import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { UpdateBannerComponent } from '../../../shared/components/update-banner/update-banner.component';

@Component({
  selector: 'app-stock.compoente',
  standalone: true,
  imports: [SideMenuComponent, UpdateBannerComponent, MenubarModule],
  templateUrl: './stock.component.html',
})
export default class StockCompoent implements OnInit {

  ngOnInit(): void { }

}
