import { Component } from '@angular/core';
import { AnalystTabsComponent } from '../../components/analyst-tabs/analyst-tabs.component';

@Component({
  selector: 'app-analyst-home',
  standalone: true,
  imports: [
    AnalystTabsComponent
  ],
  templateUrl: './analyst-home.component.html',
})

export default class AnalystHomeComponent {


}
