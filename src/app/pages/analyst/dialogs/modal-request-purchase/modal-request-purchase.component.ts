import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

import { Compra } from '../../../../models/compra.model';
import { ConfirmationService } from 'primeng/api';
import { Usuario } from '../../../../models/usuario.model';
import { PurchaseService } from '../../../../services/purchase.service';

@Component({
  selector: 'app-modal-request-purchase',
  standalone: true,
  imports: [
    DialogModule,
    TableModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './modal-request-purchase.component.html',
  styleUrl: './modal-request-purchase.component.scss'
})
export class ModalRequestPurchaseComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  compras: Compra[] = [];
  compra: Compra = new Compra;
  usuario: Usuario;

  constructor(
    private confirmationService: ConfirmationService,
    private purchaseService: PurchaseService,
    private cdr: ChangeDetectorRef,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  confirmaEliminacion(id: string) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.eliminar(id);
      },
      reject: () => { },
    });
  }

  async eliminar(id: string) {
    await this.purchaseService.delete(id);
    this.compras = this.compras
      .filter((x: Compra) => x.id != id);
    Swal.fire({
      title: "OK",
      text: "CREADO CORRECTAMENTE",
      icon: "success",
      customClass: {
        container: 'swal-topmost'
      }
    }); this.cdr.detectChanges();
  }

  async crear(form: NgForm) {

    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...',
      didOpen: () => Swal.showLoading(),
      customClass: {
        container: 'swal-topmost'
      }
    });


    await this.purchaseService.create({ ...this.compra });
    this.cdr.detectChanges();
    this.closeEvent.emit(false); // Cerrar modal
    // this.showMessage('success', 'Success', 'Guardado correctamente con referencia ' + this.activoFijo.referencia);

  }
}
