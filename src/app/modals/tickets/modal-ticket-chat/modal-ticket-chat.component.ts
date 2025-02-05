import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TicketDB } from '../../../models/ticket-db.model';
import { EditorModule } from 'primeng/editor';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-modal-ticket-chat',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    CommonModule,
    EditorModule,
    DialogModule,
    InputTextModule,
  ],
  templateUrl: './modal-ticket-chat.component.html',
  styleUrl: './modal-ticket-chat.component.scss',
})
export class ModalTicketChatComponent {
  @Input() ticket: TicketDB | any;
  @Input() showModalChatTicket: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  public userdata: any;

  constructor() {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  esmiuid(id: string): boolean {
    let st = false;
    let userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.userdata.uid;
    if (id == idu) {
      st = true;
    }
    return st;
  }

  showaddcomentario() {
    // this.modaladdcomentario = true;
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }
}
