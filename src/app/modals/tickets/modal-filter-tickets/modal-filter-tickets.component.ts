import { Component } from '@angular/core';
import { StatusTicket } from '../../../models/status-ticket.model';
import { Categoria } from '../../../models/categoria.mdoel';
import { Proveedor } from '../../../models/proveedor.model';

@Component({
  selector: 'app-modal-filter-tickets',
  standalone: true,
  imports: [],
  templateUrl: './modal-filter-tickets.component.html',
  styleUrl: './modal-filter-tickets.component.scss'
})
export class ModalFilterTicketsComponent {
  public filterstatus: any | undefined;
  public catStatusT: StatusTicket[] = [];
  public filterPrioridad: any | undefined;
  public filtercategoria: any | undefined;
  public catcategorias: Categoria[] = [];
  public catproveedores: Proveedor[] = [];
  public filterarea: any | undefined;

  filtrarT() {
    // this.arr_tickets = [...this.all_arr_tickets];
    // if (this.filterPrioridad != undefined) {
    //   this.arr_tickets = this.arr_tickets.filter(
    //     (x) => x.prioridadsuc == this.filterPrioridad.name
    //   );
    // }

    // if (this.filterarea != undefined) {
    //   this.arr_tickets = this.arr_tickets.filter(
    //     (x) => x.idproveedor == this.filterarea.id
    //   );
    // }

    // if (this.filtercategoria != undefined) {
    //   this.arr_tickets = this.arr_tickets.filter(
    //     (x) => x.idcategoria == this.filtercategoria.id
    //   );
    // }
    // if (this.filterstatus != undefined) {
    //   this.arr_tickets = this.arr_tickets.filter(
    //     (x) => x.status == this.filterstatus.id
    //   );
    // }
    // this.showModalFinalizeTicket = false;
  }

  
  limpiarfiltro() {
    // this.arr_tickets = [...this.all_arr_tickets];
    // this.filterPrioridad = undefined;
    // this.filterarea = undefined;
    // this.filtercategoria = undefined;
    // this.filterstatus = undefined;
    // this.showModalFinalizeTicket = false;
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
    // if (this.filterarea != undefined) {
    //   this.catalogosService.getCategoriasprov(this.filterarea.id).subscribe({
    //     next: (data) => {
    //       this.catcategorias = data;
    //       this.cdr.detectChanges();
    //     },
    //     error: (error) => {
    //       console.log(error);
    //       this.showMessage('error', 'Error', 'Error al procesar la solicitud');
    //     },
    //   });
    // }
  }
}
