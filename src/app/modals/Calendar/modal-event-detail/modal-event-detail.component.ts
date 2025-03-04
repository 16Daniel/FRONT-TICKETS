import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Sucursal } from '../../../models/sucursal.model';
import localeEs from '@angular/common/locales/es';
import { Ticket } from '../../../models/ticket.model';
import { PriorityTicketsAccordionComponent } from "../../../components/tickets/priority-tickets-accordion/priority-tickets-accordion.component";
import { RequesterTicketsListComponent } from "../../../components/tickets/requester-tickets-list/requester-tickets-list.component";
import { BranchMaintenanceTableComponent } from "../../../components/maintenance/branch-maintenance-table/branch-maintenance-table.component";
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../models/usuario.model';
@Component({
  selector: 'app-modal-event-detail',
  standalone: true,
  imports: [DialogModule,
    CommonModule,
    FormsModule, RequesterTicketsListComponent, BranchMaintenanceTableComponent],
  templateUrl: './modal-event-detail.component.html',
})
export default class ModalEventDetailComponent implements OnInit {
@Input() showModalEventeDetail:boolean = false; 
@Output() closeEvent = new EventEmitter<boolean>();
@Input() sucursal:Sucursal | undefined; 
@Input() fecha:Date = new Date(); 
tickets:Ticket[] = []; 
@Input() mantenimientos:Mantenimiento10x10[] = []; 
@Input() usuariosHelp:Usuario[] = []; 
@Output() clickEvent = new EventEmitter<Ticket>();
@Input() Indicacion:string = ''; 

ngOnInit(): void { }
constructor()
{
  registerLocaleData(localeEs);
}
  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.clickEvent.emit(ticket);
  }

}
