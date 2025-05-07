import { Component} from '@angular/core';
import { AdminTabsComponent } from "../../../components/tickets/admin-tabs/admin-tabs.component";

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    AdminTabsComponent
],
  templateUrl: './admin-home.component.html',
})

export default class AdminHomeComponent {

}
