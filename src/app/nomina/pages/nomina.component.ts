import { Component, type OnInit } from '@angular/core';
import { SideMenuComponent } from "../../shared/side-menu/side-menu.component";
import { UpdateBannerComponent } from "../../shared/update-banner/update-banner.component";
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-nomina',
  standalone: true,
  imports:[ CommonModule,
      RouterOutlet,
      SideMenuComponent,
      UpdateBannerComponent],
  templateUrl: './nomina.component.html',
  styleUrl: './nomina.component.scss',
})
export default class NominaComponent implements OnInit {

  ngOnInit(): void { }

}
