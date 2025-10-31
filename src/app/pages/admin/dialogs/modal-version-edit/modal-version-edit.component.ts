import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import Swal from 'sweetalert2';

import { ControlVersion } from '../../../../models/control-version.model';
import { VersionControlService } from '../../../../services/version-control.service';

@Component({
  selector: 'app-modal-version-edit',
  standalone: true,
  imports: [DialogModule, CommonModule, FormsModule, EditorModule],
  templateUrl: './modal-version-edit.component.html',
  styleUrl: './modal-version-edit.component.scss'
})
export class ModalVersionEditComponent {
  @Input() mostrarModal: boolean = false;
  @Input() version: ControlVersion = new ControlVersion;
  @Output() closeEvent = new EventEmitter<boolean>();

  constructor(
    private versionControlService: VersionControlService,
  ) { }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    console.log(this.version.descripcion)
    if (this.version.descripcion == '<p></p>') this.version.descripcion = '';
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    try {
      await this.versionControlService.update(this.version, this.version.id);
      this.onHide();
      Swal.fire({
        title: "OK",
        text: "EDITADO CORRECTAMENTE",
        icon: "success",
        customClass: {
          container: 'swal-topmost'
        }
      });

    } catch (error: any) {
      Swal.fire("Oops...", "ERROR AL ACTUALIZAR LA INFORMACIÓN", "error");
    }
  }
}
