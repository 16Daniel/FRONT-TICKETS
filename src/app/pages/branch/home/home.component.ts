import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { BranchesTabsComponent } from '../../../components/branch/branches-tabs/branches-tabs.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    CommonModule,
    BranchesTabsComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.component.html',
})
export default class HomeComponent {
  esEspectadorActivo: boolean = false;

  constructor() { }

  activarEspectador(activar: boolean) {
    this.esEspectadorActivo = activar;
  }
}
