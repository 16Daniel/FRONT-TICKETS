import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Sucursal } from '../../models/sucursal.model';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { StatusTpvsDevicesService } from '../../services/status-tpvs-devices.service';
import { EstatusTPV } from '../../models/estatus-tpv';

@Component({
  selector: 'app-tpvs-devices-table',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule],
  templateUrl: './tpvs-devices-table.component.html',
  styleUrl: './tpvs-devices-table.component.scss'
})
export class TpvsDevicesTableComponent {
  @Input() sucursal!: Sucursal;
  estatus: EstatusTPV[] = [];
  isLoading: boolean = true;

  constructor(
    private estatusService: StatusTpvsDevicesService,
    private cdr: ChangeDetectorRef) {
    this.estatusService.estatus$.subscribe(estatus => {
      this.estatus = estatus;
      this.isLoading = false;
      this.cdr.detectChanges();
    })
  }

  crearArray(cantidad: number = 0): number[] {
    return Array.from({ length: cantidad }, (_, i) => i);
  }

  getColorEstatus(idEstatus: string): string {
    debugger
    const estatus = this.estatus.find(e => e.id === idEstatus);
    return estatus ? estatus.color : '#ffffff';
  }

  verDetallesDispositivo(id: string) {
    console.log('ID del dispositivo:', id);
  }

}
