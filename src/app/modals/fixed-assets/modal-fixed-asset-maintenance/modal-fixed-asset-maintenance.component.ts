import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ActivoFijo } from '../../../models/activo-fijo.model';
import { MantenimientoActivoFijo } from '../../../models/mantenimiento-activo-fijo.model';
import { FixedAssetsService } from '../../../services/fixed-assets.service';

@Component({
  selector: 'app-modal-fixed-asset-maintenance',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule, TableModule],
  templateUrl: './modal-fixed-asset-maintenance.component.html',
  styleUrl: './modal-fixed-asset-maintenance.component.scss'
})

export class ModalFixedAssetMaintenanceComponent {
  @Input() mostrarModal: boolean = false;
  @Input() activoFijo: ActivoFijo | any;
  @Output() closeEvent = new EventEmitter<boolean>();
  mantenimientos: MantenimientoActivoFijo[] = [];
  mantenimiento: MantenimientoActivoFijo = new MantenimientoActivoFijo;

  constructor(
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fixedAssetsService: FixedAssetsService
  ) { }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  crear(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    this.fixedAssetsService
      .addMantenimiento(this.activoFijo.id, { ...this.mantenimiento })
      .then(result => {
        this.activoFijo.mantenimientos.push(result)
        this.mantenimiento = new MantenimientoActivoFijo;
        this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE')
      });
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
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

  eliminar(id: string) {

  }
}
