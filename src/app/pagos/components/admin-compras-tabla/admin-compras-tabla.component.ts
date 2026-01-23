import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore'
import Swal from 'sweetalert2';

import { SubirdocumentoComponent } from "../../dialogs/Subir-doumento/Subir-documento.component";
import { ArchivosComponent } from "../../dialogs/Archivos/Archivos.component";
import { DetallesComponent } from "../../dialogs/Detalles/Detalles.component";
import { AdminComprasChatComponent } from "../../dialogs/admin-compras-chat/admin-compras-chat.component";
import { AdministracionCompra, ArticuloCompra, Proveedor } from '../../interfaces/AdministracionCompra';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { ShoppingService } from '../../services/shopping.service';

@Component({
  selector: 'app-admin-compras-tabla',
  standalone: true,
  imports: [CommonModule, TableModule, SubirdocumentoComponent, ArchivosComponent, DetallesComponent, AdminComprasChatComponent],
  templateUrl: './admin-compras-tabla.component.html',
  styleUrl: './admin-compras-tabla.component.scss',
})
export class AdminComprasTablaComponent implements OnInit {
  @Input() data: AdministracionCompra[] = [];
  @Input() idAdmin: string = '';
  public visible: boolean = false;
  @Input() catTipoCompra: any[] = [];
  @Input() catProveedores: Proveedor[] = [];
  public modalFactura: boolean = false;
  public modalDetalles: boolean = false;
  @Input() sucursales: Sucursal[] = [];
  @Input() catStatusCompra: any[] = []
  @Input() catStatusPago: any[] = [];
  @Input() catareas: Area[] = [];
  @Input() catMetodosPago: any[] = [];
  public itemReg: AdministracionCompra | undefined;
  public fechaReg: Date = new Date();
  public modalArchivos: boolean = false;
  public modalChat: boolean = false;
  public usuario: Usuario;
  public tipoDoc: number = 1;
  @Input() autorizacion: boolean = false;
  @Input() autorizado: boolean = false;

  public docs: string = "";

  constructor(private shopServ: ShoppingService, public cdr: ChangeDetectorRef) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }
  ngOnInit(): void { }

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

  obtenerNombreSucursal(sucursal: string): string {
    let nombre = "";
    let suc = this.sucursales.filter(x => x.id == sucursal)[0];
    if (suc != undefined) { nombre = suc.nombre; }
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

    if (area != undefined) { nombre = area.nombre; }
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

  abrirModalChat(item: AdministracionCompra) {
    this.itemReg = item;
    this.modalChat = true;
  }

  abrirModalArchivos(item: AdministracionCompra, data: string, tipodoc: number) {
    this.tipoDoc = tipodoc;
    this.itemReg = item;
    this.docs = data;
    this.modalArchivos = true;
  }

  abrirModalDetalles(item: AdministracionCompra) {
    this.itemReg = item;
    this.modalDetalles = true;
  }

  abrirModalDocumento(item: AdministracionCompra, tipoDoc: number) {
    this.itemReg = item;
    this.modalFactura = true;
    this.tipoDoc = tipoDoc;
  }

  confirmarActualizacion(item: AdministracionCompra, tipo: number) {
    let text = "AUTORIZAR"
    if (tipo == 2) { text = "RECHAZAR"; }
    Swal.fire({
      title: "ESTÁS SEGURO?",
      text: "ESTÁ SEGURO QUE DESEA " + text + " LA SOLICITUD?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, " + text.toLowerCase(),
      customClass: {
        container: 'swal-topmost'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.itemReg = item;
        this.itemReg.validado = tipo;
        this.actualizarReg(this.itemReg!);
      }
    });
  }

  async actualizarReg(item: AdministracionCompra) {
    await this.shopServ.updateCompra(item);
  }

}
