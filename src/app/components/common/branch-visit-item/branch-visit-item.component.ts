import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Sucursal } from '../../../models/sucursal.model';
import { SucursalProgramada } from '../../../models/sucursal-programada.model';
import { Ticket } from '../../../models/ticket.model';
import ModalEventDetailComponent from '../../../modals/calendar/modal-event-detail/modal-event-detail.component';
import { Usuario } from '../../../models/usuario.model';
import { MantenimientoFactoryService } from '../../../pages/admin/calendar-builder/maintenance-factory.service';

@Component({
  selector: 'app-branch-visit-item',
  standalone: true,
  imports: [CommonModule, ModalEventDetailComponent],
  templateUrl: './branch-visit-item.component.html',
  styleUrl: './branch-visit-item.component.scss'
})

export class BranchVisitItemComponent {
  @Input() sucursal: Sucursal | any;
  @Input() tickets: Ticket[] = [];
  @Input() usuariosHelp: Usuario[] = [];
  @Input() fecha: any;
  @Input() usuarioSeleccionado: Usuario | undefined;
  @Input() ultimosMantenimientos: any[] = [];


  textoMantenimiento: String = '';
  showModalBranchDetail: boolean = false;
  sucursalSeleccionada: SucursalProgramada | undefined;
  usuario: Usuario;
  porcentaje$: Promise<number> | any;

  constructor(private mantenimientoFactory: MantenimientoFactoryService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit() {
    this.porcentaje$ = this.obtenerPorcentajeDeUltimoMantenimiento(this.sucursal.id);

    switch (this.usuario.idArea) {
      case '1':
        this.textoMantenimiento = '10X10';
        break;
      case '2':
        this.textoMantenimiento = '6X6';
        break;
    }
  }

  detalles(sucursal: Sucursal) {
    this.showModalBranchDetail = true;
    this.sucursalSeleccionada = {
      ...sucursal,
      idsTickets: this.tickets.map(ticket => ticket.id)
    };
  }

  asignadaAlUsuario(idSucursal: string): boolean {
    if (this.usuarioSeleccionado!.sucursales.some(sucursalUsuario => sucursalUsuario.id === idSucursal)) {
      return true;
    } else {
      return false;
    }
  }

  async obtenerPorcentajeDeUltimoMantenimiento(idSucursal: string) {
    
    let porcentaje = 0;
    let registro = this.ultimosMantenimientos.filter(x => x.idSucursal == idSucursal);
    if (registro.length > 0) {

      const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);
      porcentaje = await servicio.calcularPorcentaje(registro[0]);

    }
    return porcentaje
  }
}
