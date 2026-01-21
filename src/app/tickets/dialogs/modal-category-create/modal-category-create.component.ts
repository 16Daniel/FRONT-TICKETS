import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';

import { ModalSubcategoryCreateComponent } from '../modal-subcategory-create/modal-subcategory-create.component';
import { Categoria } from '../../models/categoria.mdoel';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Subcategoria } from '../../models/subcategoria.model';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-modal-category-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ModalSubcategoryCreateComponent, TableModule],
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
  mostrarModalSubcategoria: boolean = false;
  esNuevaSubcategoria: boolean = false;
  subcategoriaSeleccionada: Subcategoria | any;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private categoriesService: CategoriesService,
    private confirmationService: ConfirmationService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  async ngOnInit() {
    if (!this.esNuevaCategoria) {
      this.idCategoriaEditar = this.categoria.id;
    }

    if (this.esNuevaCategoria) {
      this.categoria.id = await this.categoriesService.obtenerSecuencial();
      this.cdr.detectChanges();
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
      idArea: parseInt(this.usuario.idArea)
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

  agregarSubcategoria(subcategoria: Subcategoria) {
    if (this.categoria.subcategorias == undefined)
      this.categoria.subcategorias = [];

    const index = this.categoria.subcategorias.findIndex((s: Subcategoria) => s.id === subcategoria.id);

    if (index !== -1) {
      // La subcategoría existe, reemplazamos el objeto
      this.categoria.subcategorias[index] = subcategoria;
    } else {
      // No existe, agregamos
      this.categoria.subcategorias.push(subcategoria);
    }

    this.categoria = { ...this.categoria, id: parseInt(this.categoria.id) }
    this.categoriesService
      .update(this.categoria, this.idCategoriaEditar)
      .then(() => {
        this.cdr.detectChanges();
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  abrirModalNuevaSubcategoria() {
    this.mostrarModalSubcategoria = true;
    this.esNuevaSubcategoria = true;
    this.subcategoriaSeleccionada = new Subcategoria;
  }

  obtenerSubcategorias = () =>
    this.categoria.subcategorias.filter((x: Subcategoria) => x.eliminado == false)

  confirmaEliminacion(subcategoria: Subcategoria | any) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.eliminarSubcategoria(subcategoria);
      },
      reject: () => { },
    });
  }

  eliminarSubcategoria(subcategoria: Subcategoria): void {

    if (!this.categoria.subcategorias) {
      this.categoria.subcategorias = [];
    }

    subcategoria.eliminado = true;

    const index = this.categoria.subcategorias.findIndex((s: Subcategoria) => s.id === subcategoria.id);

    if (index !== -1) {
      this.categoria.subcategorias[index] = subcategoria;
    } else {
      this.categoria.subcategorias.push(subcategoria);
    }

    this.categoria = { ...this.categoria, id: parseInt(this.categoria.id) }
    this.categoriesService
      .update(this.categoria, this.idCategoriaEditar)
      .then(() => {
        this.cdr.detectChanges();
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

}
