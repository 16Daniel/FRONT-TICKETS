import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { UpdateBannerComponent } from '../../../shared/components/update-banner/update-banner.component';

@Component({
  selector: 'app-cedis',
  standalone: true,
  imports: [SideMenuComponent, UpdateBannerComponent,CommonModule,RouterOutlet],
  templateUrl: './cedis.component.html',
  styleUrl: './cedis.component.scss',
})
export default class CedisComponent implements OnInit {

  ngOnInit(): void { }

}
