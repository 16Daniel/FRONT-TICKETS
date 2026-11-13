import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { Timestamp } from '@angular/fire/firestore';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SubirFacturaCompraDialogComponent } from '../subir-factura-compra-dialog/subir-factura-compra-dialog.component';
import { AdministracionCompra, ArticuloCompra, Proveedor } from '../../interfaces/AdministracionCompra';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { ShoppingService } from '../../services/shopping.service';

@Component({
  selector: 'app-detalle-compra-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ToastModule,
    FormsModule,
    TableModule,
    CalendarModule,
    ConfirmDialogModule,
    SubirFacturaCompraDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './detalle-compra-dialog.component.html',
  styleUrl: './detalle-compra-dialog.component.scss',
})
export class DetalleCompraDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() idAdmin: string = '';
  @Input() itemReg: AdministracionCompra | undefined;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() catStatus: any[] = [];
  @Input() catStatusPago: any[] = [];
  @Input() catMetodosPago: any[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() catProveedores: Proveedor[] = [];
  public fechaentrega: Date | null | undefined;
  public fechaPago: Date | undefined | null;
  public formStatus: string = '';
  public formStatusPago: string = '';
  public formPalabraClave: string = '';
  public formMetodoPago: string = '';
  public loading: boolean = false;
  public usuario: Usuario;

  public modalFactura: boolean = false;
  public tipoDoc: number = 1;

  constructor(
    private messageService: MessageService,
    private shopserv: ShoppingService,
    private confirmationService: ConfirmationService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    if (this.itemReg != undefined) {
      if (this.itemReg!.fechaEntrega != null) {
        this.fechaentrega = this.itemReg!.fechaEntrega!.toDate();
      }

      if (this.itemReg!.fechadepago != null) {
        this.fechaPago = this.itemReg!.fechadepago!.toDate();
      }
      this.formPalabraClave = this.itemReg.palabraclave;
      this.formStatus = this.itemReg.statuscompra;
      this.formStatusPago = this.itemReg.statuspago;
      this.formMetodoPago = this.itemReg.metodoPago;
    }
  }

  onHide() {
    this.closeEvent.emit(false);
  }

  abrirLink(Url: string) {
    window.open(Url, '_blank');
  }

  async guardar() {
    this.loading = true;
    if (this.fechaentrega != undefined) {
      this.itemReg!.fechaEntrega = Timestamp.fromDate(this.fechaentrega);
    }

    if (this.fechaPago != undefined) {
      this.itemReg!.fechadepago = Timestamp.fromDate(this.fechaPago);
    }
    this.itemReg!.palabraclave = this.formPalabraClave;
    this.itemReg!.statuscompra = this.formStatus;
    this.itemReg!.statuspago = this.formStatusPago;
    this.itemReg!.metodoPago = this.formMetodoPago;
    try {
      await this.shopserv.updateCompra(this.itemReg!);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Guardado correctamente',
      });
      this.loading = false;
    } catch (error) {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar',
      });
      this.loading = false;
    }
  }

  solicitarCancelacion() {
    this.confirmationService.confirm({
      header: '¿Solicitar cancelación?',
      message: '¿Está seguro que desea enviar la solicitud de cancelación para esta compra?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, solicitar',
      rejectLabel: 'Volver',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.enviarSolicitudCancelacion();
      },
      reject: () => {},
    });
  }

  async enviarSolicitudCancelacion() {
    this.itemReg!.solicitudCancelacion = true;

    this.itemReg?.comentarios.push({
      comentario: 'Se solicita cancelación',
      idUsuario: this.usuario.id,
      nombre: this.usuario.nombre,
      fecha: new Date(),
    });

    try {
      await this.shopserv.updateCompra(this.itemReg!);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Solicitud enviada correctamente',
      });
      this.loading = false;
      this.closeEvent.emit(false);
    } catch (error) {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar',
      });
      this.loading = false;
    }
  }

  confirmarCancelacion() {
    this.confirmationService.confirm({
      header: '¿Confirmar cancelación?',
      message: '¿Está seguro que desea cancelar definitivamente esta compra?',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, cancelar compra',
      rejectLabel: 'Volver',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.cancelarCompra();
      },
      reject: () => {},
    });
  }

  async cancelarCompra() {
    this.itemReg!.statuscompra = '0';
    try {
      await this.shopserv.updateCompra(this.itemReg!);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Cancelado correctamente',
      });
      this.loading = false;
      this.closeEvent.emit(false);
    } catch (error) {
      console.log(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar',
      });
      this.loading = false;
    }
  }

  obtenerTotalCompras(articulos: ArticuloCompra[]): number {
    let total = 0;
    for (let item of articulos) {
      total = total + item.precio * item.uds;
    }
    return total;
  }

  obtenerNombreSucursal(idSucursal: string): string {
    let nombre = '';
    const sucursal = this.sucursales.filter((x) => x.id == idSucursal)[0];
    if (sucursal != undefined) {
      nombre = sucursal.nombre;
    }
    return nombre;
  }

  obtenerProveedor(idProveedor: string | null): Proveedor[] {
    let data: Proveedor[] = [];
    if (idProveedor) {
      data = this.catProveedores.filter((x) => x.id == idProveedor);
    }
    return data;
  }

  abrirModalDocumento(item: AdministracionCompra, tipoDoc: number) {
    this.itemReg = item;
    this.modalFactura = true;
    this.tipoDoc = tipoDoc;
  }
}
