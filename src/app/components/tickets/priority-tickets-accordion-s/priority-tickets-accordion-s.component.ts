import { Component, EventEmitter, input, Input, Output, type OnInit } from '@angular/core';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Sucursal } from '../../../models/sucursal.model';
import { Ticket } from '../../../models/ticket.model';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { RequesterTicketsListComponent } from '../requester-tickets-list/requester-tickets-list.component';
import { CommonModule } from '@angular/common';
import { BranchMaintenanceTableComponent } from "../../maintenance/branch-maintenance-table/branch-maintenance-table.component";
import { Usuario } from '../../../models/usuario.model';
import { UsersService } from '../../../services/users.service';
@Component({
  selector: 'app-priority-tickets-accordion-s',
  standalone: true,
  imports: [
    CommonModule,
    BadgeModule,
    AccordionModule,
    RequesterTicketsListComponent,
    BranchMaintenanceTableComponent
],
  templateUrl: './priority-tickets-accordion-s.component.html',
})
export class PriorityTicketsAccordionSComponent implements OnInit {
@Input() arr_ultimosmantenimientos:Mantenimiento10x10[] = []; 
@Input() tickets: Ticket[] = [];
@Input() sucursales:Sucursal[] = []; 
@Input() ordenarxmantenimiento:boolean = false;  
@Output() clickEvent = new EventEmitter<Ticket>();
public itemtk: Ticket | undefined;
showModalTicketDetail: boolean = false;
usuariosHelp: Usuario[] = [];

constructor(
    private usersService: UsersService
  ){}
  ngOnInit(): void 
  {
    this.obtenerUsuariosHelp();
   }

   obtenerUsuariosHelp() {
    this.usersService.getusers().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        // this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  obtenerColorDeFondoSucursal(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#ff0000';
    }

    if (value > 0 && value <= 4) {
      str = '#ffe800';
    }

    if (value == 0) {
      str = '#00a312';
    }

    return str;
  }

  obtenerColorDeFondoSucursal10x10(value: number): string {
    let str = '';

    if (value <=50) {
      str = '#ff0000';
    }

    if (value > 50 && value <= 80) {
      str = '#ffe800';
    }

    if (value > 80) {
      str = '#00a312';
    }

    return str;
  }


  obtenerTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }


  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {
    return catsucursales.sort((a, b) => {
      if(this.ordenarxmantenimiento)
        {
          const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id);
          const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id);
          return mantenimientoA - mantenimientoB; // Ordena de mayor a menor
        }else
        {
          const ticketsA = this.obtenerTicketsPorSucursal(a.id).length;
          const ticketsB = this.obtenerTicketsPorSucursal(b.id).length;
          return ticketsB - ticketsA; // Ordena de mayor a menor
        }
    });
  }

  obtenerColorDeTexto(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#fff';
    }

    if (value > 0 && value <= 4) {
      str = '#000';
    }
    
    if (value == 0) {
      str = '#fff';
    }

    return str;
  }  

  obtenerColorDeTexto10x10(value: number): string {
    let str = '';

    if (value <= 50) {
      str = '#fff';
    }

    if (value > 50 && value <= 80) {
      str = '#000';
    }

    if (value > 80) {
      str = '#fff';
    }

    return str;
  }  

  obtenerPorcentajedeUltimoMantenimiento(idSucursal:string):number
  {
      let porcentaje = 0; 
      let registro = this.arr_ultimosmantenimientos.filter(x => x.idSucursal == idSucursal); 
      if(registro.length>0)
      {
        porcentaje = this.calcularPorcentaje(registro[0]);
      }
      return porcentaje
  }

  
  calcularPorcentaje(mantenimiento: Mantenimiento10x10):number {
    let porcentaje = 0;
    mantenimiento.mantenimientoCaja ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoImpresoras ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoRack ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoPuntosVentaTabletas
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoContenidosSistemaCable
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoInternet ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoCCTV ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoNoBrakes ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoTiemposCocina ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoConcentradorApps
      ? (porcentaje += 10)
      : porcentaje;

    return porcentaje;
  }
 

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.clickEvent.emit(ticket);
  }

  obtenerMantenimientoPorSucursal(idSucursal:string):Mantenimiento10x10[]
  {
    return this.arr_ultimosmantenimientos.filter(x =>x.idSucursal == idSucursal);  
  }
}
