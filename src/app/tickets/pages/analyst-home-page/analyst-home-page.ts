import { Component } from '@angular/core';
import { AnalistaTabsComponent } from '../../components/analista-tabs/analista-tabs.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-analyst-home-page',
  standalone: true,
  imports: [
    AnalistaTabsComponent,
    PageHeaderComponent
  ],
  templateUrl: './analyst-home-page.html',
  styleUrl: './analyst-home-page.scss'
})

export default class AnalystHomePageComponent {
}
