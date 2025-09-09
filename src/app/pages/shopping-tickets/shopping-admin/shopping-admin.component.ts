import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { MessagesModule } from 'primeng/messages';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarModule } from 'primeng/calendar';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

import { ShoppingService } from '../../../services/shopping.service';
import { ProveedoresComponent } from "./dialogs/proveedores/proveedores.component";
import { BranchesService } from '../../../services/branches.service';
import { Sucursal } from '../../../models/sucursal.model';
import { AdministracionCompra, ArticuloCompra, Proveedor } from '../../../models/AdministracionCompra';
import { SubirdocumentoComponent } from "./dialogs/Subir-doumento/Subir-documento.component";
import { AgregarCompraComponent } from "./dialogs/agregar-compra/agregar-compra.component";
import { ArchivosComponent } from "./dialogs/Archivos/Archivos.component";
import { DetallesComponent } from "./dialogs/Detalles/Detalles.component";
import { SideMenuComponent } from "../../../shared/side-menu/side-menu.component";
import { AdminComprasChatComponent } from "./dialogs/admin-compras-chat/admin-compras-chat.component";
import { Usuario } from '../../../models/usuario.model';
import { GraficaAdminComprasComponent } from "./components/grafica-admin-compras/grafica-admin-compras.component";
import { Area } from '../../../models/area.model';
import { AreasService } from '../../../services/areas2.service';

@Component({
  selector: 'app-shopping-admin',
  standalone: true,
  imports: [CommonModule, DialogModule, TableModule, FormsModule, ProveedoresComponent,
    DropdownModule, SubirdocumentoComponent, AgregarCompraComponent, ArchivosComponent,
    DetallesComponent, SideMenuComponent, AdminComprasChatComponent, CalendarModule, GraficaAdminComprasComponent,
    MessagesModule, TooltipModule],
  templateUrl: './shopping-admin.component.html',
  styleUrl: './shopping-admin.component.scss'
})

export default class ShoppingAdminComponent implements OnInit {
  public visible: boolean = false;
  public catTipoCompra: any[] = [];
  public catProveedores: Proveedor[] = [];
  public modalProveedores: boolean = false;
  public modalFactura: boolean = false;
  public modalDetalles: boolean = false;
  public sucursales: Sucursal[] = [];
  public catStatusCompra: any[] = [{ id: '1', nombre: 'EN GESTIÓN' }, { id: '0', nombre: 'CANCELADO' }, { id: '2', nombre: 'COMPRADO' }, { id: '3', nombre: 'ENTREGADO' }, { id: '4', nombre: 'EN DEVOLUCIÓN' }, { id: '5', nombre: 'OTRO' }]
  public catStatusPago: any[] = [{ id: '1', nombre: 'POR PAGAR' }, { id: '2', nombre: 'PAGADO' }]
  public filtrocatStatusCompra: any[] = [{ id: '-1', nombre: 'TODO' }, { id: '1', nombre: 'EN GESTIÓN' }, { id: '0', nombre: 'CANCELADO' }, { id: '2', nombre: 'COMPRADO' }, { id: '3', nombre: 'ENTREGADO' }, { id: '4', nombre: 'EN DEVOLUCIÓN' }, { id: '5', nombre: 'OTRO' }]
  public filtrocatStatusPago: any[] = [{ id: '-1', nombre: 'TODO' }, { id: '1', nombre: 'POR PAGAR' }, { id: '2', nombre: 'PAGADO' }]
  public regcompras: AdministracionCompra[] = [];
  public facturasPendientes: AdministracionCompra[] = [];
  public itemReg: AdministracionCompra | undefined;
  public fechaReg: Date = new Date();
  public modalArchivos: boolean = false;
  public modalChat: boolean = false;
  public usuario: Usuario;
  //productivo
  public idAdmin: string = 'pclOBh7sMdziimACOc1w';

  // public idAdmin:string = 'QvSLmxLZjJnaGPPsA7zi';
  public filtroFechaIni: Date | undefined;
  public filtroFechaFin: Date | undefined;
  public filtroStatus: string = "-1";
  public filtroStatusPago: string = "1";
  public filtroSucursal: Sucursal | undefined;
  public filtroTipo: string = "-1";
  public filtroRegion: string = '-1';
  public filtrocatTipoCompra: any[] = [];
  public catareas: Area[] = [];
  public catMetodosPago: any[] = [{ id: '1', nombre: 'EFECTIVO' }, { id: '2', nombre: 'TRANSFERENCIA' }];
  public messages: any[] = [{ severity: 'error', detail: 'Tiene facturas pendientes por subir con más de 7 días posteriores a la fecha de pago. Favor de cargar los documentos para poder generar nuevas solicitudes' }];
  public tipoDoc: number = 1;

  constructor(
    private shopServ: ShoppingService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private areasService: AreasService,
  ) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  ngOnInit(): void {
    this.obtenerFacturasPendientes()
    this.obtenerTipoCompras();
    this.obtenerProveedores();
    this.obtenerSucursales();
    // this.obtenerAreas();
    if (this.usuario.id == this.idAdmin) {
      this.obtenerCompras();
    } else {
      this.obtenerComprasUsuario();
    }
  }

  obtenerCompras() {
    this.shopServ.getCompras().subscribe({
      next: (data) => {
        this.regcompras = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  obtenerFacturasPendientes() {
    this.shopServ.obtenerComprasFacturaPendiente(this.usuario.id).subscribe({
      next: (data) => {
        this.facturasPendientes = data;
        let temp: AdministracionCompra[] = [];
        for (let item of this.facturasPendientes) {
          let valor = true;
          for (let art of item.articulos) {
            if (art.tipo == "ON-LINE") {
              valor = false;
            }
          }

          if (valor) {
            temp.push(item);
          }
        }
        this.facturasPendientes = [...temp];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  obtenerComprasUsuario() {
    this.shopServ.getComprasUsuario(this.usuario.id).subscribe({
      next: (data) => {
        this.regcompras = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  obtenerComprasFiltro() {
    this.regcompras = [];
    Swal.showLoading();
    let idArea = '-1';
    if ((this.usuario.idRol == '1' || this.usuario.idRol == '5') && this.usuario.id != this.idAdmin) {
      idArea = this.usuario.idArea;
    }
    let idsuc = this.filtroSucursal == undefined ? '' : this.filtroSucursal.id;
    let idusuario = this.usuario.id == this.idAdmin ? '' : this.usuario.id;
    if (this.usuario.idRol == '1' || this.usuario.idRol == '5') {
      idusuario = '';
    }
    this.shopServ.getComprasFiltro(this.filtroFechaIni, this.filtroFechaFin, this.filtroStatus, this.filtroStatusPago, idsuc, idusuario, this.filtroTipo, this.filtroRegion, idArea).subscribe({
      next: (data) => {
        this.regcompras = data;
        Swal.close();
        this.cdr.detectChanges();
      },
      error: (error) => {
        Swal.close();
        console.log(error);
      },
    });
  }

  abrirModal() {
    this.visible = true;
  }
  abrirModalChat(item: AdministracionCompra) {
    this.itemReg = item;
    this.modalChat = true;
  }
  abrirModalArchivos(item: AdministracionCompra) {
    this.itemReg = item;
    this.modalArchivos = true;
  }
  abrirModalDetalles(item: AdministracionCompra) {
    this.itemReg = item;
    this.modalDetalles = true;
  }
  obtenerTipoCompras() {
    this.shopServ.getCatTipo().subscribe({
      next: (data) => {
        this.catTipoCompra = data;
        this.filtrocatTipoCompra = [...this.catTipoCompra];
        this.filtrocatTipoCompra.unshift({ id: "-1", nombre: 'TODO' })
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  obtenerProveedores() {
    this.shopServ.getProveedores().subscribe({
      next: (data) => {
        this.catProveedores = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        // this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }


  abrirModalProveedores() {
    this.modalProveedores = true;
    this.cdr.detectChanges();
  }

  abrirModalDocumento(item: AdministracionCompra, tipodoc: number) {
    this.itemReg = item;
    this.tipoDoc = tipodoc;
    this.modalFactura = true;
  }

  obtenerFecha(value: Timestamp): Date {
    return value.toDate();
  }

  obtenerNombreArticulos(articulos: ArticuloCompra[]): string {
    let valor = "";

    for (let item of articulos) {
      valor = valor + item.art + ", ";
    }
    valor = valor.substring(0, valor.length - 2);
    return valor;
  }

  obtenerNombreSucursal(sucursales: string[]): string {
    let nombre = "";
    for (let suc of sucursales) {
      let sucursal = this.sucursales.filter(x => x.id == suc)[0];

      if (sucursal != undefined) { nombre += sucursal.nombre + ', '; }
    }
    if (nombre != '') { nombre = nombre.substring(0, nombre.length - 2); }
    return nombre;
  }

  obtenerNombreRegiones(regiones: string[]): string {
    let nombre = "";
    for (let reg of regiones) {
      nombre += reg + ', ';
    }
    if (nombre != '') { nombre = nombre.substring(0, nombre.length - 2); }
    return nombre;
  }

  obtenerNombreArea(idarea: string): string {
    let nombre = "";
    let area = this.catareas.filter(x => x.id == idarea)[0];

    if (idarea != undefined) { nombre = area.nombre; }
    return nombre;
  }

  downloadPdfDirect(pdfUrl: string) {
    window.open(pdfUrl, '_blank');
  }

  obtenerNombreEstatus(id: string): string {
    return this.catStatusCompra.filter(x => x.id == id).length > 0 ? this.catStatusCompra.filter(x => x.id == id)[0].nombre : '';
  }
  obtenerNombreEstatusPago(id: string): string {
    return this.catStatusPago.filter(x => x.id == id).length > 0 ? this.catStatusPago.filter(x => x.id == id)[0].nombre : '';
  }
  obtenerNombreMetodoPago(id: string): string {
    return this.catMetodosPago.filter(x => x.id == id).length > 0 ? this.catMetodosPago.filter(x => x.id == id)[0].nombre : '';
  }



  verificarChatNoLeido(ticket: AdministracionCompra) {
    const participantes = ticket.participantesChat.sort(
      (a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido
    );
    const participante = participantes.find(
      (p) => p.idUsuario === this.usuario.id
    );

    if (participante) {
      const ultimoComentarioLeido = this.modalChat
        ? ticket.comentarios.length
        : participante.ultimoComentarioLeido;
      const comentarios = ticket.comentarios;

      // Si el último comentario leído es menor que la longitud actual de los comentarios
      return comentarios.length > ultimoComentarioLeido;

    }

    return false;
  }

  obtenerTotalCompras(articulos: ArticuloCompra[]): number {
    let total = 0;
    for (let item of articulos) {
      total = total + (item.precio * item.uds);
    }
    return total;
  }

  // obtenerAreas() {
  //   this.areasService.get().subscribe({
  //     next: (data) => {
  //       this.catareas = data;
  //       this.cdr.detectChanges();
  //     },
  //     error: (error) => {
  //       console.log(error);
  //     },
  //   });
  // }

  hanPasado7Dias(fecha: Date): boolean {
    const hoy = new Date();
    const fechaLimite = new Date(fecha);
    fechaLimite.setDate(fechaLimite.getDate() + 7);

    return hoy >= fechaLimite;
  }


  exportToExcel(compras: AdministracionCompra[], filename: string = 'compras.xlsx'): void {
    // Transformar los datos para tener una fila por artículo
    const datosExportar = this.transformarDatos(compras);

    // Crear libro de trabajo y hoja
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Compras');

    // Guardar el archivo
    XLSX.writeFile(wb, filename);
  }

  private transformarDatos(compras: AdministracionCompra[]): any[] {
    const datos: any[] = [];

    compras.forEach(compra => {
      compra.articulos.forEach(articulo => {
        datos.push({
          // Datos de la compra
          // 'ID Compra': compra.id || '',
          'Fecha': this.formatTimestamp(compra.fecha),
          'Mes': compra.mes,
          'Razón Social': compra.razonsocial,
          'Status Compra': this.obtenerNombreEstatus(compra.statuscompra),
          'Status Pago': this.obtenerNombreEstatusPago(compra.statuspago),
          'Fecha de Pago': this.formatTimestamp(compra.fechadepago),
          'Fecha Entrega': this.formatTimestamp(compra.fechaEntrega),
          'Tipo Compra': this.obtenerNombreTipocompra(compra.tipoCompra),
          'Método Pago': this.obtenerNombreMetodoPago(compra.metodoPago),

          // Datos del artículo
          'Artículo': articulo.art,
          'Unidades': articulo.uds,
          'Precio': articulo.precio,
          'Tipo compra': articulo.tipo,
          'Link de compra': articulo.link,
          'Justificación': articulo.justificacion,
          'Proveedor': articulo.nomprov || '',
          'Región': articulo.region,
          'Dirección Entrega': articulo.direccionentrega,
          // Campos adicionales si los necesitas
          'Sucursal': this.obtenerNombreSucursalArt(articulo.idsucursal),
          'Área': this.obtenerNombreArea(compra.idArea || ''),
          'Palabra clave': compra.palabraclave,
          'Factura': compra.factura,
          'Comprobante de pago': compra.comprobantePago,
        });
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

  obtenerNombreTipocompra(idTipoCompra: string) {
    let nombre = "";
    let tipocompra = this.catTipoCompra.filter(x => x.id == idTipoCompra)[0];

    if (tipocompra != undefined) { nombre = tipocompra.nombre; }
    return nombre;
  }

  obtenerNombreSucursalArt(idSucursal: string): string {
    let nombre = "";

    let sucursal = this.sucursales.filter(x => x.id == idSucursal)[0];

    if (sucursal != undefined) { nombre = sucursal.nombre; }
    return nombre;
  }

}
