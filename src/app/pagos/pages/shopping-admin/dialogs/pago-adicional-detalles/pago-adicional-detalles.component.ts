import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Timestamp } from '@angular/fire/firestore';

import { environment } from '../../../../../../environments/environments';
import { Usuario } from '../../../../../usuarios/models/usuario.model';
import { ShoppingService } from '../../../../services/shopping.service';
import { PagoAdicional } from '../../../../interfaces/AdministracionCompra';

@Component({
  selector: 'app-pago-adicional-detalles',
  standalone: true,
  imports: [CommonModule, DialogModule, ToastModule, FormsModule, TableModule, CalendarModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pago-adicional-detalles.component.html',
  styleUrl: './pago-adicional-detalles.component.scss',
})
export class PagoAdicionalDetallesComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() itemReg: PagoAdicional | undefined;
  @Output() closeEvent = new EventEmitter<boolean>();
  idAdmin: string = environment.idAdministracion;
  public loading: boolean = false;
  public usuario: Usuario;

  public formSolicitante: string = "";
  public formBeneficiario: string = "";
  public formMonto: number = 0;
  public formJustificacion: string = "";
  public estatus: string = "1";

  constructor(
    private messageService: MessageService,
    private shopserv: ShoppingService,
    private confirmationService: ConfirmationService,
  ) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  ngOnInit(): void {
    this.formSolicitante = this.itemReg!.solicitante;
    this.formBeneficiario = this.itemReg!.beneficiario;
    this.formMonto = this.itemReg!.monto;
    this.formJustificacion = this.itemReg!.justificacion;
    this.estatus = this.itemReg!.status;
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }


  async guardar() {
    this.loading = true;

    this.itemReg!.solicitante = this.formSolicitante;
    this.itemReg!.beneficiario = this.formBeneficiario;
    this.itemReg!.monto = this.formMonto;
    this.itemReg!.justificacion = this.formJustificacion;

    if (this.itemReg!.status != this.estatus) {
      if (this.estatus == "2") {
        this.itemReg!.fechaPago = Timestamp.fromDate(new Date())
      } else {
        this.itemReg!.fechaPago = null;
      }
    }

    this.itemReg!.status = this.estatus;
    try {
      await this.shopserv.updatePagoAdicional(this.itemReg!);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Guardado correctamente'
      });
      this.loading = false;
    } catch (error) {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar'
      });
      this.loading = false;
    }
  }

  solicitarCancelacion() {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: 'Está segur@ que desea cancelar el pago?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.enviarSolicitudCancelacion();
      },
      reject: () => { },
    });
  }

  async enviarSolicitudCancelacion() {
    this.itemReg!.solicitudCancelacion = true;

    this.itemReg?.comentarios.push({ comentario: 'Se solicita cancelación', idUsuario: this.usuario.id, nombre: this.usuario.nombre, fecha: new Date() })

    try {
      await this.shopserv.updatePagoAdicional(this.itemReg!);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Solicitud enviada correctamente'
      });
      this.loading = false;
      this.closeEvent.emit(false);
    } catch (error) {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar'
      });
      this.loading = false;
    }
  }

  confirmarCancelacion() {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: 'Está segur@ que desea cancelar el pago?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.cancelarpago();
      },
      reject: () => { },
    });
  }

  async cancelarpago() {
    this.itemReg!.status = '0';
    try {
      await this.shopserv.updatePagoAdicional(this.itemReg!);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Cancelado correctamente'
      });
      this.loading = false;
      this.closeEvent.emit(false);
    } catch (error) {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar'
      });
      this.loading = false;
    }
  }

}
