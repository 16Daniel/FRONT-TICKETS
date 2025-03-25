import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { ControlVersion } from '../../../models/control-version.model';
import { VersionControlService } from '../../../services/version-control.service';

@Component({
  selector: 'app-version-control',
  standalone: true,
  imports: [FormsModule, EditorModule, CommonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './version-control.component.html',
  styleUrl: './version-control.component.scss',
})
export default class VersionControlComponent {
  controlVersion: ControlVersion = new ControlVersion();

  constructor(
    private versionControlService: VersionControlService,
    private messageService: MessageService
  ) {}

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    try {
      await this.versionControlService.create({
        ...this.controlVersion,
        descripcion: this.controlVersion.descripcion.trim()
      });
      this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');
      this.controlVersion = new ControlVersion();
    } catch(error: any) {
      this.showMessage('error', 'Error', error);
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
