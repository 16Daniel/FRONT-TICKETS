import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { UpdateBannerComponent } from '../../../shared/components/update-banner/update-banner.component';

@Component({
  selector: 'app-cedis-page',
  standalone: true,
  imports: [SideMenuComponent, UpdateBannerComponent,CommonModule,RouterOutlet],
  templateUrl: './cedis-page.component.html',
  styleUrl: './cedis-page.component.scss',
})
export default class CedisPageComponent implements OnInit {

  ngOnInit(): void { }

}
