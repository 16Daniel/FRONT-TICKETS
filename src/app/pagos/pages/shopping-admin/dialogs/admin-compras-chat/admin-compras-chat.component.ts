import { Component, EventEmitter, Input, Output, ViewChild, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { CardModule } from 'primeng/card';

import { AdministracionCompra, PagoAdicional } from '../../../../../models/AdministracionCompra';
import { Usuario } from '../../../../../models/usuario.model';
import { ShoppingService } from '../../../../../services/shopping.service';
import { DatesHelperService } from '../../../../../helpers/dates-helper.service';
import { MensajesPendientesService } from '../../../../../services/mensajes-pendientes.service';

@Component({
  selector: 'app-admin-compras-chat',
  standalone: true,
  imports: [FormsModule,
    CardModule,
    CommonModule,
    EditorModule,
    DialogModule,
    InputTextModule,],
  providers: [MessageService],
  templateUrl: './admin-compras-chat.component.html',
})

export class AdminComprasChatComponent implements OnInit {
  @Input() showModalChatCompra: boolean = false;
  @Input() ticket: AdministracionCompra | PagoAdicional | undefined;
  @Output() closeEvent = new EventEmitter<boolean>();
  @ViewChild('chatContainer') private chatContainer: any;

  userdata: Usuario;
  comentario: string = '';

  constructor(
    private shopSev: ShoppingService,
    private messageService: MessageService,
    public datesHelper: DatesHelperService,
    private mensajesPendientesService: MensajesPendientesService
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  async ngOnInit() {
    if ("tipoPago" in this.ticket!) {
      await this.mensajesPendientesService.marcarComoLeidos(
        this.ticket!.id!,
        'Pagos',
        this.userdata.id
      );

      this.shopSev.updateLastCommentRead(
        this.ticket!.id!,
        this.userdata.id,
        this.ticket!.comentarios.length,
        2
      );
    } else {
      await this.mensajesPendientesService.marcarComoLeidos(
        this.ticket!.id!,
        'Compras',
        this.userdata.id
      );

      this.shopSev.updateLastCommentRead(
        this.ticket!.id!,
        this.userdata.id,
        this.ticket!.comentarios.length,
        1
      );
    }
  }

  esmiId(id: string): boolean {
    let st = false;
    let userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.userdata.id;
    if (id == idu) {
      st = true;
    }
    return st;
  }

  onHide = () => this.closeEvent.emit(false);

  enviarComentarioChat() {
    if (!this.comentario) {
      return;
    }

    let idu = this.userdata.id;

    let data = {
      nombre: this.userdata.nombre + ' ' + this.userdata.apellidoP,
      idUsuario: idu,
      comentario: this.comentario,
      fecha: new Date(),
    };
    this.ticket!.comentarios.push(data);

    if ("tipoPago" in this.ticket!) {
      this.shopSev
        .updatePagoAdicional(this.ticket)
        .then(async () => {
          this.showMessage('success', 'Success', 'Enviado correctamente');
          this.comentario = '';
          this.shopSev.updateLastCommentRead(
            this.ticket!.id!,
            this.userdata.id,
            this.ticket!.comentarios.length,
            2
          );

          await this.mensajesPendientesService.crearMensajesPendientes(
            'Pagos',
            this.ticket!.id!,
            {
              idUsuario: idu,
              nombre: data.nombre,
              comentario: data.comentario
            },
            this.ticket!.participantesChat
          );
        })
        .catch((error) =>
          console.error('Error al actualizar los comentarios:', error)
        );
    } else {
      this.shopSev
        .updateCompra(this.ticket)
        .then(async () => {
          this.showMessage('success', 'Success', 'Enviado correctamente');
          this.comentario = '';
          this.shopSev.updateLastCommentRead(
            this.ticket!.id!,
            this.userdata.id,
            this.ticket!.comentarios.length,
            1
          );

          await this.mensajesPendientesService.crearMensajesPendientes(
            'Compras',
            this.ticket!.id!,
            {
              idUsuario: idu,
              nombre: data.nombre,
              comentario: data.comentario
            },
            this.ticket!.participantesChat
          );
        })
        .catch((error) =>
          console.error('Error al actualizar los comentarios:', error)
        );

    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  // Detecta cuando el componente ha sido actualizado
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // Método para hacer scroll hacia abajo
  private scrollToBottom(): void {
    if (this.chatContainer) {
      // Desplazarse hacia abajo del contenedor
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    }
  }
}
