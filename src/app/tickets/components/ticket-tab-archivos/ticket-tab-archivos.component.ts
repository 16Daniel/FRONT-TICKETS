import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Ticket } from '../../interfaces/ticket.model';
import { FileUtils } from '../../../shared/utils/file.utils';
import { ModalVisorImagenesComponent } from '../../../shared/dialogs/modal-visor-imagenes/modal-visor-imagenes.component';

@Component({
  selector: 'app-ticket-tab-archivos',
  standalone: true,
  imports: [CommonModule, TooltipModule, ModalVisorImagenesComponent],
  templateUrl: './ticket-tab-archivos.component.html',
  styleUrl: './ticket-tab-archivos.component.scss',
})
export class TicketTabArchivosComponent {
  @Input() ticket!: Ticket;

  public fileUtils = FileUtils;
  mostrarModalImagen = false;
  urlVisorImagen = '';

  abrirModalImagen(url: string): void {
    this.mostrarModalImagen = true;
    this.urlVisorImagen = url;
  }
}
