import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Timestamp } from '@angular/fire/firestore';
import { MultiSelectModule } from 'primeng/multiselect';

import { ReporteAceiteTab } from '../reporte-aceite-tab/reporte-aceite-tab';
import { AceiteService } from '../../services/aceite.service';
import { Sucursal } from '../../../sucursales/models/sucursal.model';
import { EntregaAceite } from '../../models/aceite.model';

export type SubTabHistorialId = 'ACEITE' | 'TRAMPA' | 'REPORTE';

@Component({
  selector: 'app-historial-aceite-tab',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CalendarModule,
    FormsModule,
    MultiSelectModule,
    ReporteAceiteTab,
  ],
  templateUrl: './historial-aceite-tab.component.html',
  styleUrl: './historial-aceite-tab.component.scss',
})
export class HistorialAceiteTabComponent implements OnInit {
  fechaini: Date = new Date();
  fechafin: Date = new Date();
  @Input() sucursales: Sucursal[] = [];
  public sucursalesSel: Sucursal[] = [];
  public loading: boolean = false;
  public entregasH: EntregaAceite[] = [];
  public entregasTAH: EntregaAceite[] = [];
  public tabActivo: SubTabHistorialId = 'ACEITE';

  constructor(
    public aceiteService: AceiteService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void { }

  seleccionarTab(tab: SubTabHistorialId): void {
    this.tabActivo = tab;
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  buscarRegistros(): void {
    this.loading = true;
    const temp = this.sucursalesSel.map(item => item.idFront!);
    const idf = JSON.stringify(temp);

    this.aceiteService.getEntregasCedisH(idf, this.fechaini, this.fechafin).subscribe({
      next: (data) => {
        this.entregasH = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
        this.cdr.detectChanges();
      },
    });
  }

  buscarRegistrosTA(): void {
    this.loading = true;
    const temp = this.sucursalesSel.map(item => item.idFront!);
    const idf = JSON.stringify(temp);

    this.aceiteService.getEntregasCedisTAH(idf, this.fechaini, this.fechafin).subscribe({
      next: (data) => {
        this.entregasTAH = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
        this.cdr.detectChanges();
      },
    });
  }

  exportarExcel(estrampa: boolean): void {
    this.loading = true;
    const data = estrampa ? this.entregasTAH : this.entregasH;

    this.aceiteService.exportarHistorialEntregas(data).subscribe({
      next: (response) => {
        this.loading = false;
        this.cdr.detectChanges();
        const base64String = response.archivoBase64;
        const binaryString = window.atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = estrampa
          ? 'HISTORIAL ENTREGAS TRAMPA DE GRASA.xlsx'
          : 'HISTORIAL ENTREGAS DE ACEITE.xlsx';
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      },
      error: (error) => {
        this.loading = false;
        this.showMessage('error', 'Error', 'Error al generar el archivo de excel');
        console.log(error);
        this.cdr.detectChanges();
      },
    });
  }

  obtenerNombreSucursal(idSucursal: number): string {
    const found = this.sucursales.find((x) => x.idFront == idSucursal);
    return found ? found.nombre : '';
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      const firestoreTimestamp = tsmp;
      return firestoreTimestamp.toDate();
    } catch {
      return tsmp;
    }
  }
}
