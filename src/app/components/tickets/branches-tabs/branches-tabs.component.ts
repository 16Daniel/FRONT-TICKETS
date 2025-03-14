import { Component } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { BranchesSysTabComponent } from '../branches-sys-tab/branches-sys-tab.component';

@Component({
  selector: 'app-branches-tabs',
  standalone: true,
  imports: [TabViewModule, BranchesSysTabComponent],
  templateUrl: './branches-tabs.component.html',
  styleUrl: './branches-tabs.component.scss',
})
export class BranchesTabsComponent {
}
