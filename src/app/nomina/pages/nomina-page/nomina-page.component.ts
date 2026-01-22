import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { UpdateBannerComponent } from '../../../shared/components/update-banner/update-banner.component';

@Component({
  selector: 'app-nomina-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SideMenuComponent,
    UpdateBannerComponent
  ],
  templateUrl: './nomina-page.component.html',
  styleUrl: './nomina-page.component.scss',
})
export default class NominaPageComponent implements OnInit {

  ngOnInit(): void { }

}
