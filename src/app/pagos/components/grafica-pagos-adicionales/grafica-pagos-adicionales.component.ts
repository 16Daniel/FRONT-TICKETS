import { CommonModule } from '@angular/common';
import { Component, Input, type OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PagoAdicional } from '../../interfaces/AdministracionCompra';

@Component({
  selector: 'app-grafica-pagos-adicionales',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './grafica-pagos-adicionales.component.html',
  styleUrl: './grafica-pagos-adicionales.component.scss',
})
export class GraficaPagosAdicionalesComponent implements OnInit {
  @Input() registros: PagoAdicional[] = [];
  public single: any[] = [];
  public single2: any[] = [];
  gradient: boolean = false;
  public colorScheme: any = {
    domain: [
      '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
      '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
      '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
      '#795548', '#9E9E9E', '#607D8B', '#F44336', '#E57373',
      '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7',
      '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775',
      '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65', '#A1887F',
      '#90A4AE', '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
      '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA',
      '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740'
    ]
  };

  ngOnInit(): void {
    debugger
    let solicitantes = new Set(this.registros.map(x => x.solicitante));
    for (let item of solicitantes) {
      let total = this.registros.filter(x => x.solicitante == item && x.status != "0").reduce((acc: any, item: PagoAdicional) => acc + item.monto, 0);
      if (total > 0) {
        this.single.push({ name: item, value: total })
      }

    }

    let beneficiarios = new Set(this.registros.map(x => x.beneficiario));
    for (let item of beneficiarios) {
      let total = this.registros.filter(x => x.beneficiario == item && x.status != "0").reduce((acc: any, item: PagoAdicional) => acc + item.monto, 0);

      if (total > 0) {
        this.single2.push({ name: item, value: total })
      }
    }
  }

}
