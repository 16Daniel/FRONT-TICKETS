import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { UpdateBannerComponent } from '../../../shared/components/update-banner/update-banner.component';

@Component({
  selector: 'app-nomina',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SideMenuComponent,
    UpdateBannerComponent
  ],
  templateUrl: './nomina.component.html',
  styleUrl: './nomina.component.scss',
})
export default class NominaComponent implements OnInit {

  ngOnInit(): void { }

}
