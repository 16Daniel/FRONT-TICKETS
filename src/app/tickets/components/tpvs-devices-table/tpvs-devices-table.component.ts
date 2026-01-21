import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { StatusTpvsDevicesService } from '../../../activos-fijos/services/status-tpvs-devices.service';
import { ModalColorEstatusDispositivoTpvComponent } from '../../../activos-fijos/dialogs/modal-color-estatus-dispositivo-tpv/modal-color-estatus-dispositivo-tpv.component';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { DispositivoTPV } from '../../../activos-fijos/interfaces/dispositivo-tpv';
import { EstatusTPV } from '../../../activos-fijos/interfaces/estatus-tpv';

@Component({
  selector: 'app-tpvs-devices-table',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule, ModalColorEstatusDispositivoTpvComponent],
  templateUrl: './tpvs-devices-table.component.html',
  styleUrl: './tpvs-devices-table.component.scss'
})
export class TpvsDevicesTableComponent implements OnInit {
  @Input() sucursal!: Sucursal;
  dispositivoSeleccionado!: DispositivoTPV;

  estatus: EstatusTPV[] = [];
  isLoading: boolean = true;
  mostrarModaalEstatus: boolean = false;
  tipo!: string;
  tabletasFaltantes: number[] = [];
  tpvsFaltantes: number[] = [];
  usuario!: Usuario;

  constructor(
    private estatusService: StatusTpvsDevicesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.estatusService.estatus$.subscribe((estatus) => {
      this.estatus = estatus;
      this.isLoading = false;
      this.actualizarFaltantes();
      this.cdr.detectChanges();
    });

    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  private actualizarFaltantes(): void {
    const faltantesTabletas = Math.max(
      (this.sucursal.tabletasRequeridas || 0) - (this.sucursal.tabletas?.length || 0),
      0
    );

    const faltantesTpvs = Math.max(
      (this.sucursal.tpvsRequeridos || 0) - (this.sucursal.tpvs?.length || 0),
      0
    );

    this.tabletasFaltantes = Array.from({ length: faltantesTabletas }, (_, i) => i);
    this.tpvsFaltantes = Array.from({ length: faltantesTpvs }, (_, i) => i);
  }

  getColorEstatus(idEstatus: string): string {
    const estatus = this.estatus.find((e) => e.id === idEstatus);
    return estatus ? estatus.color : '#ffffff';
  }

  getNombreEstatus(idEstatus: string): string {
    const estatus = this.estatus.find((e) => e.id === idEstatus);
    return estatus ? estatus.nombre : '...';
  }

  verDetallesDispositivo(dispositivo: DispositivoTPV, tipo: string): void {
    if (this.usuario.idRol == '1' || this.usuario.idRol == '5') {
      console.log('Ddispositivo:', dispositivo);
      this.mostrarModaalEstatus = true;
      this.dispositivoSeleccionado = dispositivo;
      this.tipo = tipo;
    }
    else return;
  }
}
