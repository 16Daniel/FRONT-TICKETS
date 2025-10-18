import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { Ticket } from '../../models/ticket.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-notificacion-nuevo-mensaje-chat',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './notificacion-nuevo-mensaje-chat.component.html',
  styleUrls: ['./notificacion-nuevo-mensaje-chat.component.scss']
})
export class NotificacionNuevoMensajeChatComponent implements OnInit, OnDestroy {
  @Input() tickets: Ticket[] = [];

  visible = false;
  contador = 5;
  private intervalId: any;
  private reminderInterval: any;

  usuario!: Usuario;

  constructor(private cdr: ChangeDetectorRef) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit() {
    this.reminderInterval = setInterval(() => {

      console.log('leyendo tickets...', this.tickets.length)
      this.tickets.forEach(ticket => {
        console.log(this.verificarChatNoLeido(ticket), ticket.folio)
        if (this.verificarChatNoLeido(ticket)) {
          this.mostrarRecordatorio();
          return;
        }

      });

    }, 10000);
  }

  ngOnDestroy() {
    clearInterval(this.reminderInterval);
    clearInterval(this.intervalId);
  }

  mostrarRecordatorio() {
    if (this.visible) return;

    this.visible = true;
    this.contador = 5;
    clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      this.contador--;
      this.cdr.detectChanges();

      if (this.contador <= 0) {
        this.cerrar();
      }
    }, 1000);
  }

  cerrar() {
    this.visible = false;
    clearInterval(this.intervalId);
    this.cdr.detectChanges();
  }

  verificarChatNoLeido(ticket: Ticket) {
    const participantes = ticket.participantesChat.sort(
      (a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido
    );
    const participante = participantes.find(
      (p) => p.idUsuario === this.usuario.id
    );

    if (participante) {
      const ultimoComentarioLeido = participante.ultimoComentarioLeido;

      const comentarios = ticket.comentarios;

      return comentarios.length > ultimoComentarioLeido;
    }

    return false;
  }
}
