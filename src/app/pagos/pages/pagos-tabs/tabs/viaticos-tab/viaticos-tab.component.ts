import { Component } from '@angular/core';
import { AgregarPagoComponent } from "../components/agregar-pago/agregar-pago.component";
import { CommonModule } from '@angular/common';

import { AdminPagosAdicionalesTableComponent } from "../../../shopping-admin/components/admin-pagos-adicionales-table/admin-pagos-adicionales-table.component";
import { FiltroPagosAdicionalesComponent } from "../../../shopping-admin/components/filtro-pagos-adicionales/filtro-pagos-adicionales.component";
import { GraficaPagosAdicionalesComponent } from "../../../shopping-admin/components/grafica-pagos-adicionales/grafica-pagos-adicionales.component";
import { PagoAdicional } from '../../../../interfaces/AdministracionCompra';

@Component({
  selector: 'app-viaticos-tab',
  standalone: true,
  imports: [CommonModule, AgregarPagoComponent, AdminPagosAdicionalesTableComponent, FiltroPagosAdicionalesComponent, GraficaPagosAdicionalesComponent],
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
