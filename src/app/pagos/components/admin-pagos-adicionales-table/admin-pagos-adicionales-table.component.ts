import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Timestamp } from '@angular/fire/firestore'

import { SubirDocumentoPagoDialogComponent } from "../../dialogs/subir-documento-pago-dialog/subir-documento-pago-dialog.component";
import { ArchivosPagosDialogComponent } from "../../dialogs/archivos-pagos-dialog/archivos-pagos-dialog.component";
import { AdminComprasChatDialogComponent } from "../../dialogs/admin-compras-chat-dialog/admin-compras-chat-dialog.component";
import { PagoAdicionalDetalleDialogComponent } from "../../dialogs/pago-adicional-detalle-dialog/pago-adicional-detalle-dialog.component";
import { PagoAdicional } from '../../interfaces/AdministracionCompra';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { environment } from '../../../../environments/environments';
import Swal from 'sweetalert2';
import { ShoppingService } from '../../services/shopping.service';

@Component({
  selector: 'app-admin-pagos-adicionales-table',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule, SubirDocumentoPagoDialogComponent, ArchivosPagosDialogComponent, AdminComprasChatDialogComponent, PagoAdicionalDetalleDialogComponent],
  templateUrl: './admin-pagos-adicionales-table.component.html',
  styleUrl: './admin-pagos-adicionales-table.component.scss',
})
export class AdminPagosAdicionalesTableComponent {
  @Input() data: PagoAdicional[] = [];
  @Input() tipoPago: number = 1;
  public modalSubirDocumentos: boolean = false;
  public itemReg: PagoAdicional | undefined;
  public modalArchivos: boolean = false;
  public docs: string = "";
  public modalChat: boolean = false;
  public usuario: Usuario;
  public modalDetalles: boolean = false;
  public idAdmin: string = environment.idAdministracion;

  constructor(private shopServ: ShoppingService) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  obtenerFecha(value: Timestamp): Date {
    return value.toDate();
  }

  abrirModalSubirDoc(item: PagoAdicional) {
    this.itemReg = item;
    this.modalSubirDocumentos = true;
  }

  abrirModalVerDocs(item: PagoAdicional) {
    this.itemReg = item;
    this.docs = item.documentos;
    this.modalArchivos = true;
  }

  abrirModalChat(item: PagoAdicional) {
    this.itemReg = item;
    this.modalChat = true;
  }

  verificarChatNoLeido(ticket: PagoAdicional) {
    const participantes = ticket.participantesChat.sort(
      (a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido
    );
    const participante = participantes.find(
      (p) => p.idUsuario === this.usuario.id
    );

    if (participante) {
      const ultimoComentarioLeido = this.modalChat
        ? ticket.comentarios.length
        : participante.ultimoComentarioLeido;
      const comentarios = ticket.comentarios;

      // Si el último comentario leído es menor que la longitud actual de los comentarios
      return comentarios.length > ultimoComentarioLeido;

    }

    return false;
  }

  abrirModalDetalles(item: PagoAdicional) {
    this.itemReg = item;
    this.modalDetalles = true;
  }

  async actualizarReg(item: PagoAdicional) {
      await this.shopServ.updatePagoAdicional(item);
    }

  actualizarValidacionGerente(valor:boolean, item:PagoAdicional)
    {
      let text = "AUTORIZAR"
      if (valor == false) { text = "RECHAZAR"; }
      Swal.fire({
        title: "ESTÁS SEGURO?",
        text: "ESTÁ SEGURO QUE DESEA " + text + " LA SOLICITUD?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, " + text.toLowerCase(),
        customClass: {
          container: 'swal-topmost'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          item.validacionGerente = valor; 
          this.actualizarReg(item);
        }
      });
    }

}
