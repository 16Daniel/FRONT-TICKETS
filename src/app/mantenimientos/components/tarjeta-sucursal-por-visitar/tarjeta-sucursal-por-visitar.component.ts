import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';
import ModalEventDetailComponent from '../../dialogs/modal-event-detail/modal-event-detail.component';
import { Ticket } from '../../../tickets/models/ticket.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Sucursal } from '../../../sucursales/models/sucursal.model';
import { SucursalProgramada } from '../../interfaces/sucursal-programada.interface';

@Component({
  selector: 'app-tarjeta-sucursal-por-visitar',
  standalone: true,
  imports: [CommonModule, ModalEventDetailComponent],
  templateUrl: './tarjeta-sucursal-por-visitar.component.html',
  styleUrl: './tarjeta-sucursal-por-visitar.component.scss'
})

export class TarjetaSucursalPorVisitarComponent {
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

  constructor(
    private mantenimientoFactory: MantenimientoFactoryService,
    private usuarioSucursalService: UsuarioSucursalService
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
        this.textoMantenimiento = '8X8';
        break;
      case '4':
        this.textoMantenimiento = '8X8';
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
    if (!this.usuarioSeleccionado?.id) return false;
    const areaId = this.usuarioSeleccionado.idArea || this.usuario?.idArea;
    const ids = this.usuarioSucursalService.obtenerSucursalesPorUsuario(
      'SOPORTE',
      String(this.usuarioSeleccionado.id),
      areaId
    );
    return ids.includes(String(idSucursal));
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
