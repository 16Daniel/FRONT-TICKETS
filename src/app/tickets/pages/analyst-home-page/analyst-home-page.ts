import { Component } from '@angular/core';
import { AnalystTabsComponent } from '../../components/analyst-tabs/analyst-tabs.component';

@Component({
  selector: 'app-analyst-home-page',
  standalone: true,
  imports: [
    AnalystTabsComponent
  ],
  templateUrl: './analyst-home-page.html',
})

export default class AnalystHomePage {


}
