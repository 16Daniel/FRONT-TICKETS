import { Component, type OnInit } from '@angular/core';
import { SideMenuComponent } from "../../shared/side-menu/side-menu.component";
import { UpdateBannerComponent } from "../../shared/update-banner/update-banner.component";
import { MenubarModule } from "primeng/menubar";

@Component({
  selector: 'app-stock.compoente',
  standalone: true,
  imports: [SideMenuComponent, UpdateBannerComponent, MenubarModule],
  templateUrl: './stock.component.html',
})
export default class StockCompoent implements OnInit {

  ngOnInit(): void { }

}
