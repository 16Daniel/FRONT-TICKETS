import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-activity',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule],
  templateUrl: './modal-activity.component.html',
  styleUrl: './modal-activity.component.scss'
})
export class ModalActivityComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() activityEvent = new EventEmitter<string>();

  actividad: string = '';

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }


    this.activityEvent.emit(this.actividad);
  }
}
