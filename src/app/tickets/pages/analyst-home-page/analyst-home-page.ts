import { Component } from '@angular/core';
import { TicketsTabComponent } from '../../components/tickets-tab/tickets-tab.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-analyst-home-page',
  standalone: true,
  imports: [
    TicketsTabComponent,
    PageHeaderComponent
  ],
  templateUrl: './analyst-home-page.html',
  styleUrl: './analyst-home-page.scss'
})

export default class AnalystHomePageComponent {
}
