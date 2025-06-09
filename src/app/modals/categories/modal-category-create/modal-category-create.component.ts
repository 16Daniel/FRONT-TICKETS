import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { Categoria } from '../../../models/categoria.mdoel';
import { CategoriesService } from '../../../services/categories.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-modal-category-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './modal-category-create.component.html',
  styleUrl: './modal-category-create.component.scss'
})

export class ModalCategoryCreateComponent {
  @Input() mostrarModalCrearCategoria: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() categoria: Categoria | any;
  @Input() esNuevaCategoria: boolean = true;
  idCategoriaEditar: string = '';
  usuario: Usuario;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private categoriesService: CategoriesService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    if (!this.esNuevaCategoria) {
      this.idCategoriaEditar = this.categoria.id;
    }
  }

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

    this.esNuevaCategoria ? this.crear() : this.actualizar();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async crear() {
    this.categoria =
    {
      ...this.categoria,
      id: parseInt(this.categoria.id),
      idArea: this.usuario.idArea
    }
    try {
      await this.categoriesService.create({ ...this.categoria });
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Guardado correctamente');

    } catch (error: any) {
      this.showMessage('error', 'Error', error.message);
    }
  }

  actualizar() {
    this.categoria = { ...this.categoria, id: parseInt(this.categoria.id) }
    this.categoriesService
      .update(this.categoria, this.idCategoriaEditar)
      .then(() => {
        this.cdr.detectChanges();
        this.closeEvent.emit(false); // Cerrar modal
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }
}
