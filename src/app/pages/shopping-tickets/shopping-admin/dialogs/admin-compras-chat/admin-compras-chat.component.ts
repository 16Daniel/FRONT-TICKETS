import { Component, EventEmitter, Input, Output, ViewChild, type OnInit } from '@angular/core';
import { AdministracionCompra } from '../../../../../models/AdministracionCompra';
import { Usuario } from '../../../../../models/usuario.model';
import { ShoppingService } from '../../../../../services/shopping.service';
import { MessageService } from 'primeng/api';
import { Timestamp } from '@angular/fire/firestore';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-compras-chat',
  standalone: true,
  imports: [ FormsModule,
      CardModule,
      CommonModule,
      EditorModule,
      DialogModule,
      InputTextModule,],
  providers:[MessageService],
  templateUrl: './admin-compras-chat.component.html',
})
export class AdminComprasChatComponent implements OnInit {
@Input() showModalChatCompra: boolean = false;
  @Input() ticket: AdministracionCompra[] | any;
  @Output() closeEvent = new EventEmitter<boolean>();
  @ViewChild('chatContainer') private chatContainer: any;

  userdata: Usuario;
  comentario: string = '';

  constructor(
    private shopSev: ShoppingService,
    private messageService: MessageService,
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.shopSev.updateLastCommentRead(
      this.ticket.id,
      this.userdata.id,
      this.ticket.comentarios.length
    );
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

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  respuestaRapida() {
    this.comentario = "ESTE TICKET YA ESTA TERMINADO. A ESPERA QUE LA SUCURSAL VALIDE Y FINALIZE EL TICKET MIENTRAS TANTO, NO SE PODRA LEVANTAR NINGUN OTRO TICKET HASTA TENER LA VALIDACION O SE CONFIRME QUE EL TICKET NO ESTA LISTO SALUDOS..."
    this.enviarComentarioChat();
  }

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

    this.shopSev
      .updateCompra(this.ticket)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');
        this.comentario = '';

        this.shopSev.updateLastCommentRead(
          this.ticket.id,
          this.userdata.id,
          this.ticket.comentarios.length
        );

      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
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

  getDate(tsmp: Timestamp | Date): Date {
    if (tsmp instanceof Date) {
      return tsmp;
    } else {
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    }
  }

}
