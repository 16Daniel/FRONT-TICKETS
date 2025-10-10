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
export class TpvsDevicesTableComponent implements OnInit {
  @Input() sucursal!: Sucursal;

  estatus: EstatusTPV[] = [];
  isLoading: boolean = true;

  tabletasFaltantes: number[] = [];
  tpvsFaltantes: number[] = [];

  constructor(
    private estatusService: StatusTpvsDevicesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Suscripción al servicio
    this.estatusService.estatus$.subscribe((estatus) => {
      this.estatus = estatus;
      this.isLoading = false;
      this.actualizarFaltantes();
      this.cdr.detectChanges();
    });
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

  verDetallesDispositivo(id: string): void {
    console.log('ID del dispositivo:', id);
  }
}
