import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { Subcategoria } from '../../../../models/subcategoria.model';

@Component({
  selector: 'app-modal-subcategory-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './modal-subcategory-create.component.html',
  styleUrl: './modal-subcategory-create.component.scss'
})

export class ModalSubcategoryCreateComponent {
  @Input() mostrarModalSubcrearCategoria: boolean = false;
  @Input() esNuevaSubcategoria: boolean = true;
  @Input() subcategoria: Subcategoria = new Subcategoria;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() subcategoriaEvent = new EventEmitter<Subcategoria>();

  constructor(private messageService: MessageService) { }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    if (this.esNuevaSubcategoria) {
      let subcategoria = new Subcategoria;
      subcategoria = { ...subcategoria, nombre: this.subcategoria.nombre };
      this.subcategoriaEvent.emit(subcategoria);
      this.closeEvent.emit(false); // Cerrar modal
    }
    else {
      let subcategoria = this.subcategoria;
      subcategoria = { ...subcategoria, nombre: this.subcategoria.nombre };
      this.subcategoriaEvent.emit(subcategoria);
      this.closeEvent.emit(false); // Cerrar modal
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
