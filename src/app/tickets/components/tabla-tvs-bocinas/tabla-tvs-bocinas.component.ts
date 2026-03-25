import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { StatusTpvsDevicesService } from '../../../activos-fijos/services/status-tpvs-devices.service';
import { ModalColorEstatusDispositivoTpvComponent } from '../../../activos-fijos/dialogs/modal-color-estatus-dispositivo-tpv/modal-color-estatus-dispositivo-tpv.component';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Dispositivo } from '../../../activos-fijos/interfaces/dispositivo.interface';
import { EstatusTPV } from '../../../activos-fijos/interfaces/estatus-tpv.interface';

@Component({
  selector: 'app-tabla-tvs-bocinas',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule, ModalColorEstatusDispositivoTpvComponent],
  templateUrl: './tabla-tvs-bocinas.component.html',
  styleUrl: './tabla-tvs-bocinas.component.scss'
})
export class TablaTvsBocinasComponent implements OnInit {
  @Input() sucursal!: Sucursal;

  dispositivoSeleccionado!: Dispositivo;
  estatus: EstatusTPV[] = [];
  isLoading: boolean = true;
  mostrarModaalEstatus: boolean = false;
  tipo!: string;
  usuario!: Usuario;

  constructor(
    private estatusService: StatusTpvsDevicesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.estatusService.estatus$.subscribe((estatus) => {
      this.estatus = estatus;
      this.isLoading = false;
      this.cdr.detectChanges();
    });

    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  getColorEstatus(idEstatus: string): string {
    const estatus = this.estatus.find((e) => e.id === idEstatus);
    return estatus ? estatus.color : '#ffffff';
  }

  getNombreEstatus(idEstatus: string): string {
    const estatus = this.estatus.find((e) => e.id === idEstatus);
    return estatus ? estatus.nombre : '...';
  }

  verDetallesDispositivo(dispositivo: Dispositivo, tipo: string): void {
    if (this.usuario.idRol == '1' || this.usuario.idRol == '5' || this.usuario.idRol == '4') {
      this.mostrarModaalEstatus = true;
      this.dispositivoSeleccionado = dispositivo;
      this.tipo = tipo;
    }
  }
}
