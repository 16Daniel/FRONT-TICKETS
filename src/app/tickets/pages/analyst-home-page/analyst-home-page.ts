import { Component } from '@angular/core';
import { AnalistaTabsComponent } from '../../components/analista-tabs/analista-tabs.component';

@Component({
  selector: 'app-analyst-home-page',
  standalone: true,
  imports: [
    AnalistaTabsComponent
  ],
  templateUrl: './analyst-home-page.html',
})

export default class AnalystHomePageComponent {


}
