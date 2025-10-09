import { Component, Input } from '@angular/core';
import { Sucursal } from '../../models/sucursal.model';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tpvs-devices-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './tpvs-devices-table.component.html',
  styleUrl: './tpvs-devices-table.component.scss'
})
export class TpvsDevicesTableComponent {
  @Input() sucursal!: Sucursal;

  columnasTabletas: number[] = [];
  columnasTPVs: number[] = [];

  ngOnInit(): void {
    this.generarColumnas();
  }

  ngOnChanges(): void {
    this.generarColumnas();
  }

  generarColumnas() {
    // Crear arrays con el tamaño de las requeridas
    this.columnasTabletas = Array(this.sucursal.tabletasRequeridas).fill(0);
    this.columnasTPVs = Array(this.sucursal.tpvsRequeridos).fill(0);
  }

  // Retorna si se debe mostrar laptop/celular o tache según cantidad real
  iconoTableta(index: number): string {
    return index < (this.sucursal.tabletas?.length || 0) ? 'pi pi-laptop' : 'pi pi-times';
  }

  iconoTPV(index: number): string {
    return index < (this.sucursal.tpvs?.length || 0) ? 'pi pi-mobile' : 'pi pi-times';
  }
}
