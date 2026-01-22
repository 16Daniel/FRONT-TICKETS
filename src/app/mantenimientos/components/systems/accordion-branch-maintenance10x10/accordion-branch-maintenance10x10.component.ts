import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timestamp } from "@angular/fire/firestore";
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';

import { BranchMaintenanceTableComponent } from '../branch-maintenance-table/branch-maintenance-table.component';
import { Usuario } from '../../../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../../../usuarios/services/users.service';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { DatesHelperService } from '../../../../shared/helpers/dates-helper.service';
import { Mantenimiento10x10 } from '../../../interfaces/mantenimiento-10x10.model';
import { Sucursal } from '../../../../sucursales/interfaces/sucursal.model';


@Component({
  selector: 'app-accordion-branch-maintenance10x10',
  standalone: true,
  imports: [BranchMaintenanceTableComponent, BadgeModule, CommonModule, AccordionModule],
  templateUrl: './accordion-branch-maintenance10x10.component.html',
  styleUrl: './accordion-branch-maintenance10x10.component.scss',
})

export class AccordionBranchMaintenance10x10Component {
  @Input() mantenimientos: Mantenimiento10x10[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() ordenarMantenimientosFecha: boolean = true;
  @Input() mostrarChat: boolean = false;

  mantenimientosOriginal: Mantenimiento10x10[] = [];
  mantenimientosOrdenados: Mantenimiento10x10[] = [];

  usuariosHelp: Usuario[] = [];

  constructor(
    private usersService: UsersService,
    private maintenance10x10Service: Maintenance10x10Service,
    private datesHelper: DatesHelperService

  ) { this.obtenerUsuariosHelp(); }

  obtenerUsuariosHelp() {
    this.usersService.usuarios$.subscribe(usuarios => this.usuariosHelp = usuarios);
  }

  ordenarSucursalesUserFecha(catsucursales: Sucursal[]): Sucursal[] {
    return [...catsucursales].sort((a, b) => {
      const fechaA: any = this.obtenerFechaUltimoMantenimiento(a.id);
      const fechaB: any = this.obtenerFechaUltimoMantenimiento(b.id);

      return this.firebaseTimestampToDate(fechaA).getTime() - this.firebaseTimestampToDate(fechaB).getTime();
    });
  }

  firebaseTimestampToDate(timestamp: any): Date {
    if (!timestamp) return new Date(); // o null, según lo que prefieras
    if (timestamp.toDate) return timestamp.toDate(); // Timestamp de Firebase
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000); // Formato de objeto timestamp
    return new Date(timestamp); // Por si acaso es un número o string de fecha
  }

  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {

    return catsucursales.sort((a, b) => {
      const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id);
      const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id);

      return mantenimientoA - mantenimientoB;
    });
  }

  obtenerFechaUltimoMantenimiento(idSucursal: string): Date {
    const mantenimientosSucursal = this.mantenimientos
      .filter(m => m.idSucursal == idSucursal && m.fecha);

    if (mantenimientosSucursal.length === 0) {
      // Si no hay mantenimientos, regresamos una fecha muy antigua
      return new Date(0);
    }

    // Retornar la fecha más reciente
    return mantenimientosSucursal
      .reduce((ultimo, actual) =>
        actual.fecha! > ultimo.fecha! ? actual : ultimo
      ).fecha!;
  }

  obtenerPorcentajedeUltimoMantenimiento(idSucursal: string): number {
    let porcentaje = 0;
    let registro = this.mantenimientos.filter(
      (x) => x.idSucursal == idSucursal
    );
    if (registro.length > 0) {
      let fechaM: Date;

      const valorIncierto: Date | Timestamp = registro[0].timestamp!;
      fechaM = valorIncierto instanceof Date ? valorIncierto : valorIncierto.toDate();

      let diaspasados = this.obtenerDiasPasados(idSucursal);
      if (diaspasados <= 30) {
        porcentaje = this.maintenance10x10Service.calcularPorcentaje(registro[0]);
      }
    }
    return porcentaje;
  }

  obtenerDiasPasados(idSucursal: string): number {
    let dias = 0;
    let registro = this.mantenimientos.filter(
      (x) => x.idSucursal == idSucursal
    );
    if (registro.length > 0) {

      const fecha: Date | Timestamp = this.datesHelper.getDate(registro[0].fecha!);

      const hoy = new Date();
      // Ajustar ambas fechas a UTC para evitar problemas con horario de verano
      const utc1 = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const utc2 = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

      dias = Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));

    }
    return dias;
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
