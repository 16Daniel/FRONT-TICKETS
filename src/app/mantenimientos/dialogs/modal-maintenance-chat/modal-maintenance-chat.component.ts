import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { MensajesPendientesService } from '../../../shared/services/mensajes-pendientes.service';
import { Mantenimiento10x10 } from '../../interfaces/mantenimiento-10x10.model';

@Component({
  selector: 'app-modal-maintenance-chat',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DialogModule,
  ],
  templateUrl: './modal-maintenance-chat.component.html',
  styleUrl: './modal-maintenance-chat.component.scss'
})

export class ModalMaintenanceChatComponent {
  @Input() mostrarModal: boolean = false;
  @Input() idMnatenimiento?: string;
  @Input() idArea?: string;
  @Output() closeEvent = new EventEmitter<boolean>();
  @ViewChild('chatContainer') private chatContainer: any;

  mantenimiento?: Mantenimiento10x10;
  userdata: Usuario;
  comentario: string = '';
  private mantenimientoSub?: Subscription;

  constructor(
    private mantenimientoFactory: MantenimientoFactoryService,
    private messageService: MessageService,
    public datesHelper: DatesHelperService,
    private cdr: ChangeDetectorRef,
    private mensajesPendientesService: MensajesPendientesService
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  async ngOnInit() {
    let tipoOrigen: '10x10' | '8x8' | '6x6';
    switch (this.idArea) {
      case '1':
        tipoOrigen = '10x10';
        break;
      case '2':
        tipoOrigen = '6x6';
        break;
      case '4':
        tipoOrigen = '8x8';
        break;
    }

    await this.mensajesPendientesService.marcarComoLeidos(
      this.idMnatenimiento!,
      tipoOrigen!,
      this.userdata.id
    );

    const servicio = this.mantenimientoFactory.getService(this.idArea!);

    this.mantenimientoSub = servicio.getById(this.idMnatenimiento!).subscribe(
      async (mantenimiento) => {
        this.mantenimiento = mantenimiento;
        this.cdr.detectChanges();

        try {
          await servicio.updateLastCommentRead(
            this.mantenimiento!.id,
            this.userdata.id,
            this.mantenimiento!.comentarios ? this.mantenimiento!.comentarios.length : 0
          );
        } catch (error) {
          console.error('Error al actualizar last comment read', error);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.mantenimientoSub?.unsubscribe();
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

  onHide = () => this.closeEvent.emit(false)

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

    if (!this.mantenimiento!.comentarios)
      this.mantenimiento!.comentarios = [];

    this.mantenimiento!.comentarios.push(data);

    const servicio = this.mantenimientoFactory.getService(this.idArea!);

    servicio
      .update(this.mantenimiento!.id, this.mantenimiento!)
      .then(async () => {
        this.showMessage('success', 'Success', 'Enviado correctamente');
        this.comentario = '';

        await servicio.updateLastCommentRead(
          this.mantenimiento!.id,
          this.userdata.id,
          this.mantenimiento!.comentarios.length
        );

        this.cdr.detectChanges();

        let tipoOrigen: '10x10' | '8x8' | '6x6';
        switch (this.idArea) {
          case '1':
            tipoOrigen = '10x10';
            break;
          case '2':
            tipoOrigen = '6x6';
            break;
          case '4':
            tipoOrigen = '8x8';
            break;
        }

        await this.mensajesPendientesService.crearMensajesPendientes(
          tipoOrigen!,
          this.mantenimiento!.id,
          {
            idUsuario: idu,
            nombre: data.nombre,
            comentario: data.comentario
          },
          this.mantenimiento!.participantesChat
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

}
