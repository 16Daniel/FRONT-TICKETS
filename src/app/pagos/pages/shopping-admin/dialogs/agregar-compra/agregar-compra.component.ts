import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, input, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { Timestamp } from '@angular/fire/firestore';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import Swal from 'sweetalert2';

import { Usuario } from '../../../../../usuarios/models/usuario.model';
import { ShoppingService } from '../../../../services/shopping.service';
import { Sucursal } from '../../../../../sucursales/interfaces/sucursal.model';
import { AdministracionCompra, ArticuloCompra, Proveedor } from '../../../../interfaces/AdministracionCompra';
import { ParticipanteChat } from '../../../../../shared/interfaces/participante-chat.model';

@Component({
  selector: 'app-agregar-compra',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule, DropdownModule, TableModule, ToastModule],
  providers: [MessageService],
  templateUrl: './agregar-compra.component.html',
})
export class AgregarCompraComponent implements OnInit {
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() visible: boolean = false;
  @Input() catTipoCompra: any[] = [];
  @Input() catProveedores: Proveedor[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() idAdmin: string = "";
  @Input() catMetodosPago: any[] = [];
  @Input() idServicio: string = "";
  public FormSucursal: Sucursal | undefined;
  public formarticulos: ArticuloCompra[] = [];
  public formArtArticulo: string = "";
  public formArtUds: number | undefined;
  public formArtPrecio: number | undefined;
  public formArtTipo: string = "";
  public formArtLink: string = "";
  public formArtProveedor: string = "";
  public formArtJustificacion: string = "";

  public formRegion: string = "";
  public formDireccion: string = "";
  public formRazonSocial: string = "";
  public formSolicitante: string = '';
  public formMetodoPago: string = "";
  public userdata: Usuario;

  constructor(
    private shopServ: ShoppingService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) { this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  ngOnInit(): void {

    if (this.userdata.idRol == "2" && this.userdata.id != this.idServicio) {
      let suc = this.userdata.sucursales[0];
      let temp = this.sucursales.filter(x => x.id == suc.id)[0];
      this.FormSucursal = temp;
    }

    if (this.userdata.idRol == '2' && this.userdata.id != this.idServicio) {
      this.formArtTipo = '1';
    }


    if (this.userdata.idRol == '1' || this.userdata.idRol == '5') {
      this.catProveedores = this.catProveedores.filter(x => x.idUsuario == this.userdata.id || x.idArea == this.userdata.idArea);
    } else {
      this.catProveedores = this.catProveedores.filter(x => x.idUsuario == this.userdata.id);
    }

  }

  agregarArticulo() {
    let tipo = this.catTipoCompra.filter(x => x.id == this.formArtTipo)[0];
    let proveedor = this.formArtProveedor != '' ? this.catProveedores.filter(x => x.id == this.formArtProveedor)[0] : undefined;

    if (this.formarticulos.length > 0 && !this.tieneArticuloOnline() && tipo.id == '1') {
      this.showMessage('info', 'Info', 'Solo se pueden agregar artículos del mismo tipo de compra');
      return
    }

    if (this.formarticulos.length > 0 && !this.tieneArticuloOnline() && proveedor != undefined) {
      if (this.formarticulos[0].idprov != this.formArtProveedor) {
        this.showMessage('info', 'Info', 'Solo se pueden agregar artículos de un mismo proveedor');
        return;
      }
    }

    let nomprov = null;
    let idprov = null;

    if (proveedor != undefined) {
      nomprov = proveedor.razonSocial;
      idprov = proveedor.id;
    }

    this.formarticulos.push({
      art: this.formArtArticulo, uds: this.formArtUds!, precio: this.formArtPrecio!,
      tipo: tipo.nombre, link: this.formArtLink, nomprov: nomprov, justificacion: this.formArtJustificacion, idprov: idprov!,
      idTipo: tipo.id, region: this.formRegion, idsucursal: this.FormSucursal?.id, direccionentrega: this.formDireccion
    });
    this.formArtArticulo = '';
    this.formArtJustificacion = '';
    this.formArtUds = undefined;
    this.formArtPrecio = undefined;
    this.formArtTipo = "";
    this.formArtLink = '';
    this.formArtProveedor = '';
    this.formDireccion = '';
    this.formRegion = '';
    this.FormSucursal = undefined;

    if (this.userdata.idRol == "2" && this.userdata.id != this.idServicio) {
      let suc = this.userdata.sucursales[0];
      let temp = this.sucursales.filter(x => x.id == suc.id)[0];
      this.FormSucursal = temp;
    }
  }

  borrarArt(index: number) {
    this.formarticulos.splice(index, 1);
    this.cdr.detectChanges();
  }

  async guardar() {
    let fecha = new Date();
    let nombremes = this.getNombreMes(fecha.getMonth());
    let articulosdata = this.eliminarReferenciasCirculares(this.formarticulos);

    let participantesChatData: ParticipanteChat[] = [{ idUsuario: this.userdata.id, ultimoComentarioLeido: 0 }, { idUsuario: this.idAdmin, ultimoComentarioLeido: 0 }];
    if (this.userdata.idRol == "2" && this.userdata.id != this.idServicio) { participantesChatData.push({ idUsuario: this.idServicio, ultimoComentarioLeido: 0 }); }

    let validacionServico = false;
    if (this.userdata.id == this.idServicio || this.userdata.idRol == "2") { validacionServico = true; }

    let data: AdministracionCompra =
    {
      idUsuario: this.userdata.id,
      fecha: Timestamp.fromDate(fecha),
      mes: nombremes,
      razonsocial: this.formRazonSocial,
      statuscompra: '1',
      statuspago: '1',
      fechadepago: null,
      fechaEntrega: null,
      palabraclave: "",
      factura: '',
      comprobantePago: '',
      comentarios: [],
      articulos: articulosdata,
      solicitudCancelacion: false,
      participantesChat: participantesChatData,
      solicitante: this.formSolicitante,
      tipoCompra: this.formarticulos[0].idTipo,
      idArea: this.userdata.idArea == undefined ? null : this.userdata.idArea,
      metodoPago: this.formMetodoPago,
      sucursales: this.getDistinctSucursalIds(articulosdata),
      regiones: this.obtenerDistintasRegiones(articulosdata),
      validado: this.userdata.idRol == '2' ? this.userdata.id == this.idServicio ? 1 : 0 : 1,
      idSucursalSolicitante: this.userdata.idRol == '2' ? this.userdata.sucursales[0].id : null,
      validacionServico: validacionServico
    }

    try {

      await this.shopServ.AgregarCompra(data);

      this.formRazonSocial = '';
      this.formarticulos = [];
      this.formSolicitante = '';
      this.formMetodoPago = ''

      this.visible = false;
      Swal.fire({
        title: "Success!",
        text: "Guardado correctamente!",
        icon: "success"
      });
    } catch (error) {
      console.log(error);
    }
  }

  getDistinctSucursalIds(articulos: ArticuloCompra[]): string[] {
    const sucursalIds: string[] = [];
    articulos.forEach(articulo => {
      if (articulo.idsucursal !== null) {
        sucursalIds.push(articulo.idsucursal);
      }
    });
    let data = Array.from(new Set(sucursalIds))
    return data;
  }

  obtenerDistintasRegiones(articulos: ArticuloCompra[]): string[] {
    const sucursalIds: string[] = [];
    articulos.forEach(articulo => {
      if (articulo.region !== null) {
        sucursalIds.push(articulo.region);
      }
    });
    let data = Array.from(new Set(sucursalIds))
    return data;
  }

  private eliminarReferenciasCirculares(obj: any): any {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return undefined; // Eliminar referencia circular
        }
        seen.add(value);
      }
      return value;
    }));
  }

  getNombreMes(numeroMes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    if (numeroMes >= 0 && numeroMes <= 11) {
      return meses[numeroMes];
    }

    return 'Mes inválido';
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }
  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  tieneArticuloOnline(): boolean {
    let value = false;
    let tipoonline = this.formarticulos.filter(x => x.idTipo == '1');
    if (tipoonline.length > 0) {
      value = true
    }
    return value;
  }

  cambiartipo() {
    this.formArtLink = "";
    this.formArtProveedor = "";
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let nombre = "";

    let sucursal = this.sucursales.filter(x => x.id == idSucursal)[0];

    if (sucursal != undefined) { nombre = sucursal.nombre; }
    return nombre;
  }

}

