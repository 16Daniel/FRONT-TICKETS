import { Component, Input, type OnInit } from '@angular/core';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { TableModule } from 'primeng/table';
import { UsersService } from '../../../services/users.service';
import { MessageService } from 'primeng/api';
import { Usuario } from '../../../models/usuario.model';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-branch-maintenance-table',
  standalone: true,
  imports: [
    TableModule,
    CommonModule

  ],
  templateUrl: './branch-maintenance-table.component.html',
})
export class BranchMaintenanceTableComponent implements OnInit {
@Input() mantenimientos: Mantenimiento10x10[] = [];
@Input() usuariosHelp: Usuario[] = [];
public mantenimientoSeleccionado: Mantenimiento10x10 | undefined;

 constructor(
    private messageService: MessageService,
    private usersService: UsersService
  ) {
  }
  
ngOnInit(): void { }
showMessage(sev: string, summ: string, det: string) {
  this.messageService.add({ severity: sev, summary: summ, detail: det });
}

  calcularPorcentaje(mantenimiento: Mantenimiento10x10) {
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

  obtenerUsuariosHelp() {
    this.usersService.getusers().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        // this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerNombreResponsable(idUsuario: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.uid == idUsuario);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    } catch {
      return tsmp;
    }
  }

  
  onClick() {}

}
