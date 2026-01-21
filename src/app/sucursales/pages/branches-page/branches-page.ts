import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';

import { BranchesService } from '../../services/branches.service';
import { ModalBranchCreateComponent } from '../../dialogs/modal-branch-create/modal-branch-create.component';
import { Sucursal } from '../../interfaces/sucursal.model';

@Component({
  selector: 'app-branches-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    ModalBranchCreateComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './branches-page.html',
  styleUrl: './branches-page.scss'
})

export default class BranchesPageComponent implements OnInit {
  esNuevaSucursal: boolean = false;
  mostrarModalSucursal: boolean = false;
  sucursales: Sucursal[] = [];
  sucursalSeleccionada: Sucursal = new Sucursal;
  subscripcion: Subscription | undefined;

  constructor(
    private confirmationService: ConfirmationService,
    private branchesServicce: BranchesService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
  }

  ngOnDestroy() {
    if (this.subscripcion != undefined) {
      this.subscripcion.unsubscribe();
    }
  }

  obtenerSucursales = () =>
    this.subscripcion = this.branchesServicce.get().subscribe(result => {
      this.sucursales = result;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(error);
      this.showMessage('error', 'Error', 'Error al procesar la solicitud');
    });

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  abrirModalCrearSucursal() {
    this.esNuevaSucursal = true;
    this.mostrarModalSucursal = true;
  }

  abrirModalEditarSucursal(sucursal: Sucursal) {
    this.esNuevaSucursal = false;
    this.mostrarModalSucursal = true;
    this.sucursalSeleccionada = sucursal;
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
        this.eliminarSucursal(id);
      },
      reject: () => { },
    });
  }

  async eliminarSucursal(idSucursal: string) {
    await this.branchesServicce.delete(idSucursal);
    this.showMessage('success', 'Success', 'Eliminada correctamente');
  }

  cerrarModalSucursal() {
    this.mostrarModalSucursal = false;
    this.sucursalSeleccionada = new Sucursal;
  }
}
