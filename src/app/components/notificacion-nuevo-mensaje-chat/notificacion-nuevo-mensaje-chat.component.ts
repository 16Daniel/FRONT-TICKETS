import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-notificacion-nuevo-mensaje-chat',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './notificacion-nuevo-mensaje-chat.component.html',
  styleUrls: ['./notificacion-nuevo-mensaje-chat.component.scss']
})
export class NotificacionNuevoMensajeChatComponent implements OnInit, OnDestroy {
  visible = false;
  contador = 5;
  private intervalId: any;
  private reminderInterval: any;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.mostrarRecordatorio();

    this.reminderInterval = setInterval(() => {
      this.mostrarRecordatorio();
    }, 60000);
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
}
