import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

import { environment } from '../../../../../../../environments/environments';
import { Usuario } from '../../../../../../usuarios/models/usuario.model';
import { ShoppingService } from '../../../../../services/shopping.service';
import { ParticipanteChat } from '../../../../../../shared/interfaces/participante-chat.model';
import { PagoAdicional } from '../../../../../interfaces/AdministracionCompra';

@Component({
  selector: 'app-agregar-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, FileUploadModule, ToastModule, ProgressBarModule],
  providers: [MessageService],
  templateUrl: './agregar-pago.component.html',
  styleUrl: './agregar-pago.component.scss',
})
export class AgregarPagoComponent {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() visible: boolean = false;
  @Input() tipoPago: number = 1;
  public idAdmin: string = environment.idAdministracion;
  public formSolicitante: string = "";
  public formBeneficiario: string = "";
  public formMonto: number = 0;
  public formJustificacion: string = "";
  public nombretab = "";
  public usuario: Usuario;

  constructor(private shopServ: ShoppingService) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  ngOnInit(): void {
    if (this.tipoPago == 1) {
      this.nombretab = "VIÁTICO";
    }

    if (this.tipoPago == 2) {
      this.nombretab = "BONO";
    }

    if (this.tipoPago == 3) {
      this.nombretab = "FONDEO DE TARJETA";
    }

    if (this.tipoPago == 4) {
      this.nombretab = "GASOLINA";
    }
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  async guardar() {
    Swal.showLoading();
    let participantesChatData: ParticipanteChat[] = [{ idUsuario: this.usuario.id, ultimoComentarioLeido: 0 }, { idUsuario: this.idAdmin, ultimoComentarioLeido: 0 }];
    let data: PagoAdicional =
    {
      solicitante: this.formSolicitante.toUpperCase(),
      beneficiario: this.formBeneficiario.toLocaleUpperCase(),
      monto: this.formMonto,
      justificacion: this.formJustificacion.toUpperCase(),
      documentos: '',
      status: '1',
      fecha: Timestamp.fromDate(new Date()),
      idUsuario: this.usuario.id,
      idArea: this.usuario.idArea,
      comentarios: [],
      solicitudCancelacion: false,
      participantesChat: participantesChatData,
      tipoPago: this.tipoPago,
      fechaPago: null
    }

    try {

      await this.shopServ.AgregarPago(data);
      Swal.close();
      this.closeEvent.emit(false);
      this.visible = false;
      Swal.fire({
        title: "Success!",
        text: "Guardado correctamente!",
        icon: "success"
      });
    } catch (error) {
      console.log(error);
    }

  }

}
