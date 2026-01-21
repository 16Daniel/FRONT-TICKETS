import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';

import { ModalCategoryCreateComponent } from '../../dialogs/modal-category-create/modal-category-create.component';
import { Categoria } from '../../models/categoria.mdoel';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    ModalCategoryCreateComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './categories-page.html',
  styleUrl: './categories-page.scss'
})
export default class CategoriesPageComponent {
  esNuevaCategoria: boolean = false;
  mostrarModalCategoria: boolean = false;
  categorias: Categoria[] = [];
  categoriaSeleccionada: Categoria = new Categoria;
  subscripcion: Subscription | undefined;
  usuario: Usuario;

  constructor(
    private confirmationService: ConfirmationService,
    private categoriesServicce: CategoriesService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  ngOnDestroy() {
    if (this.subscripcion != undefined) {
      this.subscripcion.unsubscribe();
    }
  }

  obtenerCategorias = () =>
    this.subscripcion = this.categoriesServicce.get(this.usuario.idArea).subscribe(result => {
      this.categorias = result;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(error);
      this.showMessage('error', 'Error', 'Error al procesar la solicitud');
    });

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  abrirModalCrearCategoria() {
    this.esNuevaCategoria = true;
    this.mostrarModalCategoria = true;
  }

  abrirModalEditarCategoria(categoria: Categoria) {
    this.esNuevaCategoria = false;
    this.mostrarModalCategoria = true;
    this.categoriaSeleccionada = categoria;
  }

  confirmaEliminacion(id: string | any) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.eliminarCategoria(id);
      },
      reject: () => { },
    });
  }

  async eliminarCategoria(idCategoria: string) {
    await this.categoriesServicce.delete(idCategoria);
    this.showMessage('success', 'Success', 'Eliminada correctamente');
  }

  cerrarModalCategoria() {
    this.mostrarModalCategoria = false;
    this.categoriaSeleccionada = new Categoria;
  }

}
