import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../../components/header/header.component';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { UpdateBannerComponent } from '../../components/update-banner/update-banner.component';
import { UsuarioLogin } from '../../../auth/interfaces/usuario-login.model';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
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
