import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { Ticket } from '../../models/ticket.model';
import { Usuario } from '../../models/usuario.model';
import { MensajesPendientesService } from '../../services/mensajes-pendientes.service';
import { MensajePendiente } from '../../models/mensajes-pendientes.model';

@Component({
  selector: 'app-notificacion-nuevo-mensaje-chat',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './notificacion-nuevo-mensaje-chat.component.html',
  styleUrls: ['./notificacion-nuevo-mensaje-chat.component.scss']
})
export class NotificacionNuevoMensajeChatComponent implements OnInit, OnDestroy {
  visible = false;
  contador = 15;
  private intervalId: any;
  private reminderInterval: any;

  usuario!: Usuario;
  tiposOrigen: string[] = [];

  pendientes: MensajePendiente[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private mensajesPendientesService: MensajesPendientesService) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit() {
    this.reminderInterval = setInterval(() => {
      if (this.pendientes.length > 0) {
        this.tiposOrigen = Array.from(new Set(this.pendientes.map(p => p.tipoOrigen)));
        this.mostrarRecordatorio();
      }
    }, 60000);


    this.mensajesPendientesService
      .obtenerPendientesPorUsuario(this.usuario.id)
      .subscribe(pendientes => {
        this.pendientes = pendientes;
        if (this.pendientes.length > 0) {
          this.tiposOrigen = Array.from(new Set(this.pendientes.map(p => p.tipoOrigen)));
          this.mostrarRecordatorio();
        }
      });
  }

  ngOnDestroy() {
    clearInterval(this.reminderInterval);
    clearInterval(this.intervalId);
  }

  mostrarRecordatorio() {
    if (this.visible) return;

    this.visible = true;
    this.contador = 15;
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
}
