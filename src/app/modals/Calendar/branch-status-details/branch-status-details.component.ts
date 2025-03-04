import { Component, EventEmitter, input, Input, Output, type OnInit } from '@angular/core';
import { PriorityTicketsAccordionComponent } from "../../../components/tickets/priority-tickets-accordion/priority-tickets-accordion.component";
import { Sucursal } from '../../../models/sucursal.model';
import { Ticket } from '../../../models/ticket.model';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { BranchMaintenanceTableComponent } from "../../../components/maintenance/branch-maintenance-table/branch-maintenance-table.component";
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../models/usuario.model';
import { RequesterTicketsListComponent } from "../../../components/tickets/requester-tickets-list/requester-tickets-list.component";

@Component({
  selector: 'app-branch-status-details',
  standalone: true,
    imports: [DialogModule,
    CommonModule,
    FormsModule,
   BranchMaintenanceTableComponent, RequesterTicketsListComponent],
  templateUrl: './branch-status-details.component.html',
})
export class BranchStatusDetailsComponent implements OnInit {
  @Input() showModalBranchDetail:boolean = false; 
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() sucursal:Sucursal | undefined; 
  @Input() fecha:Date = new Date();
  @Input() mantenimientos:Mantenimiento10x10[] = []; 
  @Input() usuariosHelp:Usuario[] = []; 
  @Input() tickets:Ticket[] = []; 
  @Output() clickEvent = new EventEmitter<Ticket>();
  @Input() mostrarindicacion:boolean = false; 
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
