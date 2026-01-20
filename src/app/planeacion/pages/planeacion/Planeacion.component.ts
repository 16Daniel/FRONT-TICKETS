import { Component, type OnInit } from '@angular/core';
import { MenubarModule } from "primeng/menubar";

import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { UpdateBannerComponent } from '../../../shared/components/update-banner/update-banner.component';

@Component({
  selector: 'app-planeacion',
  standalone: true,
  imports: [SideMenuComponent, UpdateBannerComponent, MenubarModule],
  templateUrl: './Planeacion.component.html',
})
export default class PlaneacionComponent implements OnInit {

  ngOnInit(): void { }

}
