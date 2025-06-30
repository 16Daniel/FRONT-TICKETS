import { Component, type OnInit } from '@angular/core';
import { SideMenuComponent } from "../../shared/side-menu/side-menu.component";
import { UpdateBannerComponent } from "../../shared/update-banner/update-banner.component";
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

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
