import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import Swal from 'sweetalert2';

import { AdministracionCompra, PagoAdicional } from '../../interfaces/AdministracionCompra';
import { ShoppingService } from '../../services/shopping.service';

@Component({
  selector: 'app-archivos-pagos-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ToastModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './archivos-pagos-dialog.component.html',
  styleUrl: './archivos-pagos-dialog.component.scss',
})
export class ArchivosPagosDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() docs: string = '';
  @Input() itemReg: AdministracionCompra | PagoAdicional | undefined;
  @Input() tipoDoc: number = 0;
  @Output() closeEvent = new EventEmitter<boolean>();

  public loading: boolean = false;
  public links: string[] = [];

  constructor(
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private shopServ: ShoppingService
  ) {}

  ngOnInit(): void {
    if (this.docs.includes('["')) {
      const obj = JSON.parse(this.docs);
      for (const item of obj) {
        this.links.push(item);
      }
    } else {
      this.links.push(this.docs);
    }
  }

  onHide() {
    this.closeEvent.emit(false);
  }

  downloadPdfDirect(pdfUrl: string) {
    window.open(pdfUrl, '_blank');
  }

  getFileNameFromUrlManual(fileUrl: string): string {
    try {
      const decodedUrl = decodeURIComponent(fileUrl);
      const fileName = decodedUrl.split('/').pop() || '';
      return fileName.split('?')[0];
    } catch (error) {
      console.error('Error al extraer nombre:', error);
      return '';
    }
  }

  esPdf(nombre: string): boolean {
    return nombre.toLowerCase().includes('.pdf');
  }

  esExcel(nombre: string): boolean {
    return nombre.toLowerCase().includes('.xlsx') || nombre.toLowerCase().includes('.xls');
  }

  confrimarEliminar(url: string, index: number) {
    this.confirmationService.confirm({
      header: '¿Eliminar archivo?',
      message: '¿Está seguro que desea eliminar este archivo adjunto?',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Volver',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.eliminarArchivo(url, index);
      },
      reject: () => {},
    });
  }

  eliminarArchivo(url: string, index: number) {
    this.loading = true;
    let cerrarModal = false;
    this.shopServ.deleteFile(url).subscribe({
      next: () => {
        this.links.splice(index, 1);

        let jdata = JSON.stringify(this.links);
        if (this.links.length === 0) {
          jdata = '';
          cerrarModal = true;
        }

        if ('tipoPago' in this.itemReg!) {
          this.itemReg!.documentos = jdata;
        } else {
          if (this.tipoDoc === 1) {
            this.itemReg!.factura = jdata;
          } else {
            this.itemReg!.comprobantePago = jdata;
          }
        }

        this.updateDoc(cerrarModal);
      },
      error: (error) => {
        Swal.fire('Oops...', 'ERROR AL ELIMINAR EL ARCHIVO!', 'error');
        this.loading = false;
        console.log(error);
      },
    });
  }

  async updateDoc(cerrar: boolean) {
    if ('tipoPago' in this.itemReg!) {
      await this.shopServ.updatePagoAdicional(this.itemReg);
    } else {
      await this.shopServ.updateCompra(this.itemReg);
    }
    this.loading = false;
    this.cdr.detectChanges();
    if (cerrar) {
      this.closeEvent.emit(false);
    }
  }
}
