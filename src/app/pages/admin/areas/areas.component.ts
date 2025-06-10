import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';
import { Area } from '../../../models/area.model';
import { AreasService } from '../../../services/areas.service';
import { ModalAreaCreateComponent } from '../../../modals/areas/modal-area-create/modal-area-create.component';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    ModalAreaCreateComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.scss'
})

export default class AreasComponent implements OnInit, OnDestroy {

  esNuevaArea: boolean = false;
  mostrarModalArea: boolean = false;
  areas: Area[] = [];
  areaSeleccionada: Area = new Area;
  subscripcion: Subscription | undefined;


  constructor(
    private confirmationService: ConfirmationService,
    private areasServicce: AreasService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.obtenerAreas();
  }

  ngOnDestroy() {
    if (this.subscripcion != undefined) {
      this.subscripcion.unsubscribe();
    }
  }

  obtenerAreas() {
    this.subscripcion = this.areasServicce.get().subscribe(result => {
      this.areas = result;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(error);
      this.showMessage('error', 'Error', 'Error al procesar la solicitud');
    });
  }

  abrirModalCrearArea() {
    this.esNuevaArea = true;
    this.mostrarModalArea = true;
  }

  abrirModalEditarArea(area: Area) { 
    this.esNuevaArea = false;
    this.mostrarModalArea = true;
    this.areaSeleccionada = area;
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
        this.eliminarArea(id);
      },
      reject: () => { },
    });
  }

  async eliminarArea(idSucursal: string) {
    await this.areasServicce.delete(idSucursal);
    this.showMessage('success', 'Success', 'Eliminada correctamente');
  }

  cerrarModalArea() {
    this.mostrarModalArea = false;
    this.areaSeleccionada = new Area;;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
