import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../models/usuario.model';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { MessageService } from 'primeng/api';
import { DatesHelperService } from '../../../helpers/dates-helper.service';
import { MantenimientoFactoryService } from '../../../services/maintenance-factory.service';

@Component({
  selector: 'app-modal-maintenance-chat',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    // CardModule,
    // EditorModule,
    DialogModule,
    // InputTextModule
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

  constructor(
    private mantenimientoFactory: MantenimientoFactoryService,
    private messageService: MessageService,
    public datesHelper: DatesHelperService,
    private cdr: ChangeDetectorRef,
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    const servicio = this.mantenimientoFactory.getService(this.idArea!);

    servicio.getById(this.idMnatenimiento!).subscribe(mantenimiento => {
      this.mantenimiento = mantenimiento;

      this.cdr.detectChanges();

      servicio.updateLastCommentRead(
        this.mantenimiento!.id,
        this.userdata.id,
        (this.mantenimiento!.comentarios ? this.mantenimiento!.comentarios.length : 0)
      );
    });
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
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');
        this.comentario = '';

        servicio.updateLastCommentRead(
          this.mantenimiento!.id,
          this.userdata.id,
          this.mantenimiento!.comentarios.length
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
