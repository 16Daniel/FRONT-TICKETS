import { Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';

@Component({
  selector: 'app-nomina-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SideMenuComponent
  ],
  templateUrl: './nomina-page.component.html',
  styleUrl: './nomina-page.component.scss',
})
export default class NominaPageComponent implements OnInit {

  ngOnInit(): void { }

}
