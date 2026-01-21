import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from "primeng/calendar";
import { MultiSelectModule } from "primeng/multiselect";
import { MessageService } from 'primeng/api';
import { TableModule } from "primeng/table";
import * as XLSX from 'xlsx';

import { AceiteService } from '../../services/aceite.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { ReporteRA } from '../../interfaces/aceite.model';

@Component({
  selector: 'app-reporte-aceite-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, MultiSelectModule, TableModule],
  templateUrl: './reporte-aceite-tab.html',
  styleUrl: './reporte-aceite-tab.scss',
})
export class ReporteAceiteTab implements OnInit {
  fechaini: Date = new Date();
  fechafin: Date = new Date();
  @Input() sucursales: Sucursal[] = [];
  public sucursalesSel: Sucursal[] = [];
  public loading: boolean = false;
  public dataReporte: ReporteRA[] = [];

  constructor
    (public aceiteService: AceiteService,
      public cdr: ChangeDetectorRef,
      private messageService: MessageService
    ) { }

  ngOnInit(): void { }

  buscarRegistros() {
    this.loading = true
    let temp: number[] = [];
    for (let item of this.sucursalesSel) {
      temp.push(item.idFront!);
    }
    let idf = JSON.stringify(temp);
    this.aceiteService.getReporteRecoleccionAceite(idf, this.fechaini, this.fechafin).subscribe({
      next: (data) => {
        this.dataReporte = data;
        this.loading = false,
          this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
      },
    });
  }

  obtenerNombreSucursal(idSucursal: number): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.idFront == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  exportarExcel(pagos: ReporteRA[], filename: string = 'REPORTE_RECOLECCION_ACEITE.xlsx'): void {
    // Transformar los datos para tener una fila por artículo
    const datosExportar = this.transformarDatos(pagos);

    // Crear libro de trabajo y hoja
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'pagos');

    // Guardar el archivo
    XLSX.writeFile(wb, filename);
  }

  private transformarDatos(pagos: ReporteRA[]): any[] {
    const datos: any[] = [];

    pagos.forEach(item => {
      datos.push({
        'SUCURSAL': this.obtenerNombreSucursal(item.idf),
        'ENTREGA CEDIS': item.entregaCedis,
        'RECOLECCIÓN TOTAL': item.recoleccion,
        'RECOLECCIÓN CONFIRMADA PORCEDIS': item.recoleccionConfirmada,
      });
    });

    return datos;
  }

}
