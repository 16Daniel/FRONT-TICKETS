import { Component } from '@angular/core';
import { AdminTabsComponent } from '../../components/admin-tabs/admin-tabs.component';

@Component({
  selector: 'app-admin-home-page',
  standalone: true,
  imports: [AdminTabsComponent],
  templateUrl: './admin-home-page.html',
})

export default class AdminHomePageComponent {
}
