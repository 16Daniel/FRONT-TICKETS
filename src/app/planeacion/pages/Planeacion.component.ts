import { Component, type OnInit } from '@angular/core';
import { SideMenuComponent } from "../../shared/side-menu/side-menu.component";
import { UpdateBannerComponent } from "../../shared/update-banner/update-banner.component";
import { MenubarModule } from "primeng/menubar";

@Component({
  selector: 'app-planeacion',
  standalone: true,
  imports: [SideMenuComponent, UpdateBannerComponent, MenubarModule],
  templateUrl: './Planeacion.component.html',
})
export default class PlaneacionComponent implements OnInit {

  ngOnInit(): void { }

}
