import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { VersionControlService } from '../../services/version-control.service';
import { ControlVersion } from '../../interfaces/control-version.model';

@Component({
  selector: 'app-version-control-page',
  standalone: true,
  imports: [FormsModule, EditorModule, CommonModule, ToastModule],
  providers: [MessageService],
  templateUrl: './version-control-page.html',
  styleUrl: './version-control-page.scss',
})
export default class VersionControlPageComponent {
  controlVersion: ControlVersion = new ControlVersion();

  constructor(
    private versionControlService: VersionControlService,
    private messageService: MessageService
  ) { }

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
    } catch (error: any) {
      this.showMessage('error', 'Error', error);
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
