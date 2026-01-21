import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Timestamp } from '@angular/fire/firestore'

import { SubirDocumentoPagoAdicionalComponent } from "../../dialogs/subir-documento-pago-adicional/subir-documento-pago-adicional.component";
import { ArchivosComponent } from "../../dialogs/Archivos/Archivos.component";
import { AdminComprasChatComponent } from "../../dialogs/admin-compras-chat/admin-compras-chat.component";
import { PagoAdicionalDetallesComponent } from "../../dialogs/pago-adicional-detalles/pago-adicional-detalles.component";
import { PagoAdicional } from '../../interfaces/AdministracionCompra';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-admin-pagos-adicionales-table',
  standalone: true,
  imports: [CommonModule, TableModule, SubirDocumentoPagoAdicionalComponent, ArchivosComponent, AdminComprasChatComponent, PagoAdicionalDetallesComponent],
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

  constructor() {
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

}
