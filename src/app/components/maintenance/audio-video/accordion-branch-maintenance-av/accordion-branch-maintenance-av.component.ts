import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Mantenimiento6x6AV } from '../../../../models/mantenimiento-av.model';
import { Sucursal } from '../../../../models/sucursal.model';
import { UsersService } from '../../../../services/users.service';
import { MaintenancesHelperService } from '../../../../helpers/maintenances-helper.service';
import { Usuario } from '../../../../models/usuario.model';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { BranchMaintenanceTableAvComponent } from '../branch-maintenance-table-av/branch-maintenance-table-av.component';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-accordion-branch-maintenance-av',
  standalone: true,
  imports: [CommonModule, AccordionModule, BadgeModule, BranchMaintenanceTableAvComponent],
  templateUrl: './accordion-branch-maintenance-av.component.html',
  styleUrl: './accordion-branch-maintenance-av.component.scss'
})

export class AccordionBranchMaintenanceAvComponent {
  @Input() mantenimientos: Mantenimiento6x6AV[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() ordenarMantenimientosFecha: boolean = true;

  usuariosHelp: Usuario[] = [];

  constructor(
    private usersService: UsersService,
    private maintenanceHelper: MaintenancesHelperService
  ) { this.obtenerUsuariosHelp(); }

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

  ordenarSucursalesUserFecha(catsucursales: Sucursal[]): Sucursal[] {
    return [...catsucursales].sort((a, b) => {
      const fechaA = this.obtenerFechaUltimoMantenimiento(a.id);
      const fechaB = this.obtenerFechaUltimoMantenimiento(b.id);

      return this.firebaseTimestampToDate(fechaA).getTime() - this.firebaseTimestampToDate(fechaB).getTime();
    });
  }

  firebaseTimestampToDate(timestamp: any): Date {
    if (!timestamp) return new Date(); // o null, según lo que prefieras
    if (timestamp.toDate) return timestamp.toDate(); // Timestamp de Firebase
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000); // Formato de objeto timestamp
    return new Date(timestamp); // Por si acaso es un número o string de fecha
  }

  obtenerFechaUltimoMantenimiento(idSucursal: string): Date {
    const mantenimientosSucursal = this.mantenimientos
      .filter(m => m.idSucursal === idSucursal && m.fecha);

    if (mantenimientosSucursal.length === 0) {
      return new Date(0);
    }

    return mantenimientosSucursal
      .reduce((ultimo, actual) =>
        actual.fecha! > ultimo.fecha! ? actual : ultimo
      ).fecha!;
  }

  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {
    return catsucursales.sort((a, b) => {
      const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id);
      const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id);

      return mantenimientoA - mantenimientoB;
    });
  }

  obtenerPorcentajedeUltimoMantenimiento(idSucursal: string): number {
    // let porcentaje = 0;
    // let registro = this.mantenimientos.filter(
    //   (x) => x.idSucursal == idSucursal
    // );
    // if (registro.length > 0) {
    //   porcentaje = this.maintenanceHelper.calcularPorcentajeAV(registro[0]);
    // }
    // return porcentaje;
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
        porcentaje = this.maintenanceHelper.calcularPorcentajeAV(registro[0]);
      }
    }
    return porcentaje;
  }

  obtenerColorDeFondoSucursal(value: number): string {
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

  filtrarMantenimientoPorSucursal(idSucursal: string): Mantenimiento6x6AV[] {
    return this.mantenimientos.filter((x) => x.idSucursal == idSucursal);
  }

  obtenerColorDeTexto(value: number): string {
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

  obtenerDiasPasados(idSucursal: string): number {
    let dias = 0;
    let registro = this.mantenimientos.filter(
      (x) => x.idSucursal == idSucursal
    );
    if (registro.length > 0) {
      let fechaM: Date;

      const valorIncierto: Date | Timestamp = registro[0].timestamp!;
      fechaM = valorIncierto instanceof Date ? valorIncierto : valorIncierto.toDate();

      const hoy = new Date();
      // Ajustar ambas fechas a UTC para evitar problemas con horario de verano
      const utc1 = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const utc2 = Date.UTC(fechaM.getFullYear(), fechaM.getMonth(), fechaM.getDate());

      dias = Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));

    }
    return dias;
  }

}
