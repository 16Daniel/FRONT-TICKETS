import { Component, type OnInit } from '@angular/core';
import { MenubarModule } from "primeng/menubar";

import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';

@Component({
  selector: 'app-planeacion-page',
  standalone: true,
  imports: [SideMenuComponent, MenubarModule],
  templateUrl: './planeacion-page.component.html',
})
export default class PlaneacionPageComponent implements OnInit {

  ngOnInit(): void { }

}
