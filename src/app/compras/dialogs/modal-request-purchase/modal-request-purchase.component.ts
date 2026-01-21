import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';

import { ModalPurchasesImgsUploaderComponent } from '../modal-purchases-imgs-uploader/modal-purchases-imgs-uploader.component';
import { Compra } from '../../../compras/models/compra.model';
import { Area } from '../../../areas/models/area.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { PurchaseService } from '../../../compras/services/purchase.service';
import { StatusPurchaseService } from '../../../compras/services/status-purchase.service';
import { AreasService } from '../../../areas/services/areas.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { ModalVisorVariasImagenesComponent } from '../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { EstatusCompra } from '../../interfaces/estatus-compras.model';

@Component({
  selector: 'app-modal-request-purchase',
  standalone: true,
  imports: [
    DialogModule,
    TableModule,
    CommonModule,
    FormsModule,
    DropdownModule,
    TooltipModule,
    ModalPurchasesImgsUploaderComponent,
    ModalVisorVariasImagenesComponent
  ],
  templateUrl: './modal-request-purchase.component.html',
  styleUrl: './modal-request-purchase.component.scss'
})
export class ModalRequestPurchaseComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() idArea: string = '';
  @Output() closeEvent = new EventEmitter<boolean>();

  compras: Compra[] = [];
  compra: Compra = new Compra;
  usuario: Usuario;
  areas: Area[] = [];
  estatus: EstatusCompra[] = [];
  sucursales: Sucursal[] = [];
  mostrarModalSubirImagen = false;
  mostrarModalVisorImagen = false;
  compraSeleccionada!: Compra;
  imagenes: string[] = [];

  constructor(
    private purchaseService: PurchaseService,
    private statusPurchaseService: StatusPurchaseService,
    private cdr: ChangeDetectorRef,
    private areasService: AreasService,
    private branchesService: BranchesService,
    public datesHelper: DatesHelperService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.areas = this.areasService.areas;
    this.obtenerSucursales();
    this.obtenerCompras();
    this.obtenerEstatus();
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerEstatus() {
    this.statusPurchaseService.get().subscribe({
      next: (data) => {
        this.estatus = data;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerCompras() {
    this.purchaseService.getByUser(this.usuario.id).subscribe({
      next: (data) => {
        this.compras = data;
        this.cdr.detectChanges();
      }
    });
  }

  confirmaEliminacion(id: string) {
    Swal.fire({
      title: "ESTÁS SEGURO?",
      text: "ESTÁS SEGURO QUE DESEAS ELIMINAR?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!",
      customClass: {
        container: 'swal-topmost'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminar(id);
      }
    });
  }

  async eliminar(id: string) {
    await this.purchaseService.delete(id);
    this.compras = this.compras
      .filter((x: Compra) => x.id != id);
    Swal.fire({
      title: "OK",
      text: "COMPRA ELIMINADA!",
      icon: "success",
      customClass: {
        container: 'swal-topmost'
      }
    }); this.cdr.detectChanges();
  }

  async crear(form: NgForm) {

    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...',
      didOpen: () => Swal.showLoading(),
      customClass: {
        container: 'swal-topmost'
      }
    });


    await this.purchaseService.create({
      ...this.compra,
      idEstatusCompra: '1',
      idUsuario: this.usuario.id,
      idArea: this.idArea ? this.idArea : this.usuario.idArea
    });
    this.compra = new Compra;
    Swal.close();
    this.cdr.detectChanges();
    Swal.fire({
      title: "OK",
      text: "COMPRA SOLICITADA!",
      icon: "success",
      customClass: {
        container: 'swal-topmost'
      }
    }); this.cdr.detectChanges();
  }

  obtenerNombreSucursal(idSucursal: string): string {
    return this.sucursales.find(x => x.id === idSucursal)?.nombre || 'N/A';
  }

  obtenerNombreAreas(idArea: string): string {
    return this.areas.find(x => x.id === idArea)?.nombre || 'N/A';
  }

  obtenerNombreEstatus(idEstatus: string): string {
    return this.estatus.find(x => x.id === idEstatus)?.nombre || 'N/A';
  }

  getColorEstatus(idEstatusCompra: string): string {
    const estatus = this.estatus.find(e => e.id === idEstatusCompra);
    return estatus ? estatus.color : '#ffffff';
  }

  abrirModalSubirImagen(compra: Compra) {
    this.mostrarModalSubirImagen = true;
    this.compraSeleccionada = compra;
  }

  abrirModalVisorImagenes(compra: Compra) {
    this.mostrarModalVisorImagen = true;
    this.compraSeleccionada = compra;
    this.imagenes = compra.evidenciaUrls || [];
  }
}
