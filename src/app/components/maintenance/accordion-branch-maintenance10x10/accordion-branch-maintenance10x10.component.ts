import { Component, Input } from '@angular/core';
import { Sucursal } from '../../../models/sucursal.model';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Usuario } from '../../../models/usuario.model';
import { UsersService } from '../../../services/users.service';
import { BranchMaintenanceTableComponent } from '../branch-maintenance-table/branch-maintenance-table.component';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-accordion-branch-maintenance10x10',
  standalone: true,
  imports: [BranchMaintenanceTableComponent, BadgeModule, CommonModule, AccordionModule],
  templateUrl: './accordion-branch-maintenance10x10.component.html',
  styleUrl: './accordion-branch-maintenance10x10.component.scss',
})
export class AccordionBranchMaintenance10x10Component {
  @Input() mantenimientos: Mantenimiento10x10[] = [];
  @Input() sucursales:Sucursal[] = [];

  usuariosHelp: Usuario[] = [];

  constructor(private usersService: UsersService) {
    this.obtenerUsuariosHelp();
  }

  obtenerUsuariosHelp() {
    this.usersService.get().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {
    return catsucursales.sort((a, b) => {
      const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id);
      const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id);
      return mantenimientoA - mantenimientoB; // Ordena de mayor a menor
    });
  }

  obtenerPorcentajedeUltimoMantenimiento(idSucursal: string): number {
    let porcentaje = 0;
    let registro = this.mantenimientos.filter(
      (x) => x.idSucursal == idSucursal
    );
    if (registro.length > 0) {
      porcentaje = this.calcularPorcentaje(registro[0]);
    }
    return porcentaje;
  }

  calcularPorcentaje(mantenimiento: Mantenimiento10x10): number {
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

  obtenerColorDeFondoSucursal10x10(value: number): string {
    let str = '';

    if (value <= 50) {
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

  filtrarMantenimientoPorSucursal(idSucursal: string): Mantenimiento10x10[] {
    return this.mantenimientos.filter((x) => x.idSucursal == idSucursal);
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
}
