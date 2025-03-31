import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';

import { SideMenuComponent } from '../../shared/side-menu/side-menu.component';
import { UsuarioLogin } from '../../models/usuario-login.model';
import { UpdateBannerComponent } from '../../shared/update-banner/update-banner.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SideMenuComponent,
    UpdateBannerComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export default class MainComponent {
  userdata: UsuarioLogin | undefined;
  constructor(private router: Router) {
    if (localStorage.getItem("rwuserdatatk") == null) {
      this.router.navigate(["/auth"]);
    }
  }
}
