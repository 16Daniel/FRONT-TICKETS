import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-lote-referencia-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './lote-referencia-dialog.component.html'
})
export class LoteReferenciaDialogComponent {
  @Input() mostrarModal: boolean = false;
  @Input() lote: any = null;
  @Output() closeEvent = new EventEmitter<boolean>();

  referencia: number | null = null;

  onHide() {
    this.closeEvent.emit(false);
    this.referencia = null;
  }

  enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    console.log('Cambio de referencia para:', this.lote?.lote, ' Nueva Referencia:', this.referencia);

    this.closeEvent.emit(true);
    this.referencia = null;
  }
}
