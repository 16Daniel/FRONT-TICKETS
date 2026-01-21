import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgregarPagoComponent } from '../agregar-pago/agregar-pago.component';
import { AdminPagosAdicionalesTableComponent } from '../admin-pagos-adicionales-table/admin-pagos-adicionales-table.component';
import { FiltroPagosAdicionalesComponent } from '../filtro-pagos-adicionales/filtro-pagos-adicionales.component';
import { PagoAdicional } from '../../interfaces/AdministracionCompra';
import { GraficaPagosAdicionalesComponent } from '../grafica-pagos-adicionales/grafica-pagos-adicionales.component';

@Component({
  selector: 'app-viaticos-tab',
  standalone: true,
  imports: [
    CommonModule,
    AgregarPagoComponent,
    AdminPagosAdicionalesTableComponent,
    FiltroPagosAdicionalesComponent,
    GraficaPagosAdicionalesComponent
  ],
  templateUrl: './viaticos-tab.component.html',
  styleUrl: './viaticos-tab.component.scss',
})
export class ViaticosTabComponent {
  public modalAgregar: boolean = false;
  public data: PagoAdicional[] = [];
  public vergrafica: boolean = false;

  abrirModalAgregar() {
    this.modalAgregar = true;
  }

  onResultReceived(datos: PagoAdicional[]) {
    this.vergrafica = false;
    this.data = datos;
    if (this.data.length > 0) {
      setTimeout(() => {
        this.vergrafica = true;
      }, 500);
    }
  }

}
