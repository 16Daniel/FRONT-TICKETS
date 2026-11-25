import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminTicketsListComponent } from '../admin-tickets-list/admin-tickets-list.component';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Ticket } from '../../models/ticket.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Sucursal } from '../../../sucursales/models/sucursal.model';
import { TpvsDevicesTableComponent } from '../../../sucursales/components/tpvs-devices-table/tpvs-devices-table.component';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';

@Component({
  selector: 'app-acordeon-tickets-por-usuario',
  standalone: true,
  imports: [
    BadgeModule,
    CommonModule,
    FormsModule,
    AccordionModule,
    AdminTicketsListComponent,
    TpvsDevicesTableComponent
  ],
  templateUrl: './acordeon-tickets-por-usuario.component.html',
  styleUrl: './acordeon-tickets-por-usuario.component.scss',
})
export class AcordeonTicketsPorUsuarioComponent implements OnInit, OnDestroy {
  @Input() tickets: Ticket[] = [];
  @Input() usuarioAgrupacion: Usuario = new Usuario();
  @Input() sucursales: Sucursal[] = [];
  @Input() idArea: string = '';
  
  usuario: Usuario | any;
  mostrarRadiografiaMap: { [idSucursal: string]: boolean } = {};
  private usuarioSucursalSub?: Subscription;

  constructor(
    private usuarioSucursalService: UsuarioSucursalService,
    private cdr: ChangeDetectorRef
  ) { }

  activeIndex: number = -1;
  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursales.forEach(s => this.mostrarRadiografiaMap[s.id] = false);
    this.usuarioSucursalSub = this.usuarioSucursalService.usuarioSucursal$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.usuarioSucursalSub?.unsubscribe();
  }

  obtenerSucursalesDeUsuarioAgrupacion(): Sucursal[] {
    if (!this.usuarioAgrupacion) return [];

    if (String(this.usuarioAgrupacion.idRol) === '7') {
      return this.sucursales;
    }

    if (String(this.usuarioAgrupacion.idRol) === '4') {
      const areaId =
        this.idArea && String(this.idArea) !== '0'
          ? this.idArea
          : this.usuarioAgrupacion.idArea;
      const idsSoporte = this.usuarioSucursalService.obtenerSucursalesPorUsuario(
        'SOPORTE',
        String(this.usuarioAgrupacion.id),
        areaId
      );
      return this.sucursales.filter(s => idsSoporte.includes(String(s.id)));
    }

    if (this.usuarioAgrupacion.idSucursal) {
      return this.sucursales.filter(
        s => String(s.id) === String(this.usuarioAgrupacion.idSucursal)
      );
    }

    return [];
  }

  filtrarTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  contarTickets(idSucursal: number | any): number {
    return this.tickets.filter((x) => x.idSucursal == idSucursal && x.idEstatusTicket != '3').length;
  }

  obtenerColorTexto(value: number): string {
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

  obtenerClaseEstado(value: number): string {
    if (value >= 5) return 'status-critical';
    if (value > 0 && value <= 4) return 'status-warning';
    return 'status-success';
  }

  obtenerBackGroundSucursal(value: number): string {
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

  ordenarSucursalesUser(sucursales: Sucursal[]): Sucursal[] {
    let sucursalesFiltradas = [...sucursales];

    if (this.usuarioAgrupacion?.idRol === '7') {
      sucursalesFiltradas = sucursalesFiltradas.filter(sucursal =>
        this.tickets.some(tk => String(tk.idSucursal) === String(sucursal.id))
      );
    }

    return sucursalesFiltradas.sort((a, b) => {
      const ticketsA = this.contarTickets(a.id);
      const ticketsB = this.contarTickets(b.id);
      return ticketsB - ticketsA;
    });
  }

  verificarTicketsNuevos(tickets: Ticket[]) {
    let nuevosTickets = tickets.filter(x => x.idEstatusTicket == '1');
    return nuevosTickets.length > 0;
  }

  verificarTicketsPendientesValidar = (tickets: Ticket[]) =>
    tickets.filter(x => x.validacionAdmin == false && x.idEstatusTicket == '3').length > 0;

  obtenerSucursal(id: string) {
    return this.sucursales.find(x => x.id == id);
  }
}
