import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CuponesService } from '../../services/cupones.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-aida-referencia-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './aida-referencia-dialog.component.html'
})
export class AidaReferenciaDialogComponent {
  @Input() mostrarModal: boolean = false;
  @Input() configActual: any = null;
  @Output() closeEvent = new EventEmitter<boolean>();

  private cuponesService = inject(CuponesService);

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

    if (this.referencia !== null) {
      this.cuponesService.updateAidaConfig(this.referencia).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Referencia de Aida actualizada correctamente',
            confirmButtonColor: '#3085d6'
          });
          this.closeEvent.emit(true);
          this.referencia = null;
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Ocurrió un error al actualizar la referencia.',
            confirmButtonColor: '#3085d6'
          });
        }
      });
    }
  }
}
