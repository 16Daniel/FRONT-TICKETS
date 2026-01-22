import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

import { PagoAdicional } from '../../interfaces/AdministracionCompra';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { environment } from '../../../../environments/environments';
import { ShoppingService } from '../../services/shopping.service';

@Component({
  selector: 'app-filtro-pagos-adicionales',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule],
  templateUrl: './filtro-pagos-adicionales.component.html',
  styleUrl: './filtro-pagos-adicionales.component.scss',
})
export class FiltroPagosAdicionalesComponent implements OnInit {
  @Input() tipoPago: number = 0;
  @Output() result = new EventEmitter<PagoAdicional[]>();
  public filtroFechaIni: Date = this.getFirstDayOfMonth();
  public filtroFechaFin: Date = new Date();
  public filtroEstatus: string = "1";
  public filtroSolicitante: string = "";
  public filtroBeneficiario: string = "";
  public usuario: Usuario;
  public dataPagos: PagoAdicional[] = [];
  public idAdmin: string = environment.idAdministracion;

  constructor(
    private shopServ: ShoppingService,
    private cdr: ChangeDetectorRef,
  ) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }


  ngOnInit(): void {
    if (this.usuario.id == this.idAdmin) {
      this.obtenerPagosPendientes();
    } else {
      if (this.usuario.idRol == "1" || this.usuario.idRol == "5") {
        this.obtenerPagosPendientesArea();
      } else {
        this.obtenerPagosPendientesUsuario();
      }
    }
  }

  obtenerPagosPendientes() {
    Swal.showLoading();
    this.shopServ.getPagos(this.tipoPago).subscribe({
      next: (data) => {
        this.dataPagos = data;
        this.result.emit(this.dataPagos);
        Swal.close();
        this.cdr.detectChanges();
      },
      error: (error) => {
        Swal.close();
        console.log(error);
      },
    });
  }

  obtenerPagosPendientesUsuario() {
    Swal.showLoading();
    this.shopServ.getPagosUsuario(this.tipoPago, this.usuario.id).subscribe({
      next: (data) => {
        this.dataPagos = data;
        this.result.emit(this.dataPagos);
        Swal.close();
        this.cdr.detectChanges();
      },
      error: (error) => {
        Swal.close();
        console.log(error);
      },
    });
  }

  obtenerPagosPendientesArea() {
    Swal.showLoading();
    this.shopServ.getPagosArea(this.tipoPago, this.usuario.idArea).subscribe({
      next: (data) => {
        this.dataPagos = data;
        this.result.emit(this.dataPagos);
        Swal.close();
        this.cdr.detectChanges();
      },
      error: (error) => {
        Swal.close();
        console.log(error);
      },
    });
  }

  filtrar() {
    debugger
    Swal.showLoading();
    let idArea: string = "";
    let idUsuario = this.usuario.id == this.idAdmin ? '' : this.usuario.id;
    if ((this.usuario.idRol == '1' || this.usuario.idRol == '5') && this.usuario.id != this.idAdmin) {
      idArea = this.usuario.idArea;
      idUsuario = "";
    }

    this.shopServ.getPagosfiltro(this.tipoPago, this.filtroFechaIni, this.filtroFechaFin, this.filtroEstatus, idUsuario, idArea).subscribe({
      next: (data) => {
        this.dataPagos = data;
        this.result.emit(this.dataPagos);
        Swal.close();
        this.cdr.detectChanges();
      },
      error: (error) => {
        Swal.close();
        console.log(error);
      },
    });
  }

  filtrarSolicitante() {
    let data = this.dataPagos.filter(x => x.solicitante.toLowerCase().includes(this.filtroSolicitante.toLocaleLowerCase()));
    this.result.emit(data);
  }

  filtrarBeneficiario() {
    let data = this.dataPagos.filter(x => x.beneficiario.toLocaleLowerCase().includes(this.filtroBeneficiario.toLocaleLowerCase()));
    this.result.emit(data);
  }

  getFirstDayOfMonth(): Date {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  exportToExcel(pagos: PagoAdicional[], filename: string = 'pagos.xlsx'): void {
    // Transformar los datos para tener una fila por artículo
    const datosExportar = this.transformarDatos(pagos);

    // Crear libro de trabajo y hoja
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'pagos');

    // Guardar el archivo
    XLSX.writeFile(wb, filename);
  }

  private transformarDatos(pagos: PagoAdicional[]): any[] {
    const datos: any[] = [];

    pagos.forEach(item => {
      datos.push({
        'Fecha': this.formatTimestamp(item.fecha),
        'Solicitante': item.solicitante,
        'Beneficiario': item.beneficiario,
        'Monto': item.monto,
        'Justificación': item.justificacion,
        'Estatus': this.getStatus(item.status),
        'Fecha de pago': this.formatTimestamp(item.fechaPago)
      });
    });

    return datos;
  }

  private formatTimestamp(timestamp: any): string {
    if (!timestamp) return '';

    // Si es Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }

    // Si es Date o string
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return '';
    }
  }

  getStatus(val: string): string {
    let valor = "";
    if (val == '0') { valor = 'CANCELADO'; }
    if (val == '1') { valor = 'POR PAGAR'; }
    if (val == '2') { valor = 'PAGADO'; }
    return valor;
  }
}
