import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';

import { ActivoFijo } from '../../../models/activo-fijo.model';
import { FixedAssetsService } from '../../../services/fixed-assets.service';
import { ModalFixedAssetsCreateComponent } from '../../../modals/fixed-assets/modal-fixed-assets-create/modal-fixed-assets-create.component';


@Component({
  selector: 'app-fixed-assets',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    ModalFixedAssetsCreateComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './fixed-assets.component.html',
  styleUrl: './fixed-assets.component.scss'
})
export default class FixedAssetsComponent implements OnInit {
  esNuevoActivoFijo: boolean = false;
  mostrarModalActivoFijo: boolean = false;
  activosFijos: ActivoFijo[] = [];
  activoFijoSeleccionada: ActivoFijo = new ActivoFijo;
  subscripcion: Subscription | undefined;


  constructor(
    private confirmationService: ConfirmationService,
    private fixedAssetsService: FixedAssetsService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.obtenerActivosFijos();
  }

  ngOnDestroy() {
    if (this.subscripcion != undefined) {
      this.subscripcion.unsubscribe();
    }
  }

  obtenerActivosFijos() {
    this.subscripcion = this.fixedAssetsService.get().subscribe(result => {
      this.activosFijos = result;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(error);
      this.showMessage('error', 'Error', 'Error al procesar la solicitud');
    });
  }

  abrirModalCrearActivoFijo() {
    this.esNuevoActivoFijo = true;
    this.mostrarModalActivoFijo = true;
  }

  abrirModalEditarActivoFijo(activoFijo: ActivoFijo) {
    this.esNuevoActivoFijo = false;
    this.mostrarModalActivoFijo = true;
    this.activoFijoSeleccionada = activoFijo;
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
        this.eliminarActivoFijo(id);
      },
      reject: () => { },
    });
  }

  async eliminarActivoFijo(idActivoFijo: string) {
    await this.fixedAssetsService.delete(idActivoFijo);
    this.showMessage('success', 'Success', 'Eliminado correctamente');
  }

  cerrarModalActivoFijo() {
    this.mostrarModalActivoFijo = false;
    this.activoFijoSeleccionada = new ActivoFijo;;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
