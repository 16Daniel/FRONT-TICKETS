import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { ActivoFijo } from '../../../models/activo-fijo.model';
import { MantenimientoActivoFijo } from '../../../models/mantenimiento-activo-fijo.model';
import { FixedAssetsService } from '../../../services/fixed-assets.service';
import { DatesHelperService } from '../../../helpers/dates-helper.service';
import { Ticket } from '../../../models/ticket.model';
import { TicketsService } from '../../../services/tickets.service';
import { Usuario } from '../../../models/usuario.model';
import { ModalFixedAssetSelectTicketComponent } from '../../../pages/admin/dialogs/modal-fixed-asset-select-ticket/modal-fixed-asset-select-ticket.component';

@Component({
  selector: 'app-modal-fixed-asset-maintenance',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule, TableModule, ModalFixedAssetSelectTicketComponent, TooltipModule],
  templateUrl: './modal-fixed-asset-maintenance.component.html',
  styleUrl: './modal-fixed-asset-maintenance.component.scss'
})

export class ModalFixedAssetMaintenanceComponent {
  @Input() mostrarModal: boolean = false;
  @Input() activoFijo: ActivoFijo | any;
  @Output() closeEvent = new EventEmitter<boolean>();
  mantenimientos: MantenimientoActivoFijo[] = [];
  mantenimiento: MantenimientoActivoFijo = new MantenimientoActivoFijo;

  ticket: Ticket | undefined;
  mostrarModalTcikets: boolean = false;
  usuario: Usuario;

  constructor(
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fixedAssetsService: FixedAssetsService,
    public datesHelper: DatesHelperService,
    private ticketsService: TicketsService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

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
    this.fixedAssetsService
      .deleteMantenimiento(this.activoFijo.id, id)
      .then(result => {
        this.activoFijo.mantenimientos = this.activoFijo.mantenimientos
          .filter((x: MantenimientoActivoFijo) => x.id != id);
        this.cdr.detectChanges();
      });
  }

  ligarTicket(ticket: Ticket) {
    this.mantenimiento.folioTicket = ticket.folio;
  }

  buscarTicket() {
    this.ticketsService.getTicketsPorFolio(this.mantenimiento.folioTicket)
      .subscribe(result => {
        if (result.length == 0) {
          this.showMessage('warn', 'Error', 'No se encontró ticket con folio ' + this.mantenimiento.folioTicket);
          this.mantenimiento.folioTicket = '';
        }
      });
  }
}
