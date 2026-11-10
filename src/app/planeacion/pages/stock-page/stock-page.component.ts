import { Component, type OnInit } from '@angular/core';
import { MenubarModule } from "primeng/menubar";
import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';

@Component({
  selector: 'app-stock.compoente',
  standalone: true,
  imports: [SideMenuComponent, MenubarModule],
  templateUrl: './stock-page.component.html',
})
export default class StockCompoentPage implements OnInit {

  ngOnInit(): void { }

}
