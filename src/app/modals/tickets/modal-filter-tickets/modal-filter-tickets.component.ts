import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { StatusTicket } from '../../../models/status-ticket.model';
import { Categoria } from '../../../models/categoria.mdoel';
import { Proveedor } from '../../../models/proveedor.model';
import { TicketDB } from '../../../models/ticket-db.model';
import { CatalogosService } from '../../../services/catalogs.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-filter-tickets',
  standalone: true,
  imports: [DialogModule, DropdownModule, FormsModule, CommonModule],
  templateUrl: './modal-filter-tickets.component.html',
  styleUrl: './modal-filter-tickets.component.scss',
})
export class ModalFilterTicketsComponent {
  @Input() tickets: TicketDB[] = [];
  @Input() showModalFinalizeTicket: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  ticketsFiltrados: TicketDB[] = [];
  public filterstatus: any | undefined;
  public catStatusT: StatusTicket[] = [];
  public filterPrioridad: any | undefined;
  public filtercategoria: any | undefined;
  public catcategorias: Categoria[] = [];
  public catproveedores: Proveedor[] = [];
  public filterarea: any | undefined;

  constructor(
    private catalogosService: CatalogosService,
    private messageService: MessageService
  ) {}

  filtrarT() {
    this.ticketsFiltrados = [...this.tickets];
    if (this.filterPrioridad != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.prioridadsuc == this.filterPrioridad.name
      );
    }

    if (this.filterarea != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.idproveedor == this.filterarea.id
      );
    }

    if (this.filtercategoria != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.idcategoria == this.filtercategoria.id
      );
    }
    if (this.filterstatus != undefined) {
      this.ticketsFiltrados = this.ticketsFiltrados.filter(
        (x) => x.status == this.filterstatus.id
      );
    }
    this.closeEvent.emit(false); // Cerrar modal
  }

  limpiarfiltro() {
    this.ticketsFiltrados = [...this.tickets];
    this.filterPrioridad = undefined;
    this.filterarea = undefined;
    this.filtercategoria = undefined;
    this.filterstatus = undefined;
    this.closeEvent.emit(false); // Cerrar modal
  }

  getBgPrioridad(value: string): string {
    let str = '';

    if (value == 'ALTA') {
      str = '#ff0000';
    }

    if (value == 'MEDIA') {
      str = '#ffe800';
    }

    if (value == 'BAJA') {
      str = '#61ff00';
    }
    return str;
  }

  changeprovFilter() {
    if (this.filterarea != undefined) {
      this.catalogosService.getCategoriasprov(this.filterarea.id).subscribe({
        next: (data) => {
          this.catcategorias = data;
          // this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
          this.showMessage('error', 'Error', 'Error al procesar la solicitud');
        },
      });
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }
}
