import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

import { Compra } from '../../../../models/compra.model';
import { ConfirmationService } from 'primeng/api';
import { Usuario } from '../../../../models/usuario.model';
import { PurchaseService } from '../../../../services/purchase.service';
import { Area } from '../../../../models/area.model';
import { Sucursal } from '../../../../models/sucursal.model';
import { DropdownModule } from 'primeng/dropdown';
import { AreasService } from '../../../../services/areas.service';
import { BranchesService } from '../../../../services/branches.service';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { StatusPurchaseService } from '../../../../services/status-purchase.service';
import { EstatusCompra } from '../../../../models/estatus-compras.model';

@Component({
  selector: 'app-modal-request-purchase',
  standalone: true,
  imports: [
    DialogModule,
    TableModule,
    CommonModule,
    FormsModule,
    DropdownModule
  ],
  templateUrl: './modal-request-purchase.component.html',
  styleUrl: './modal-request-purchase.component.scss'
})
export class ModalRequestPurchaseComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  compras: Compra[] = [];
  compra: Compra = new Compra;
  usuario: Usuario;
  areas: Area[] = [];
  estatus: EstatusCompra[] = [];
  sucursales: Sucursal[] = [];

  constructor(
    private confirmationService: ConfirmationService,
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
    this.obtenerSucursales();
    this.obtenerAreas();
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

  obtenerAreas() {
    this.areasService.get().subscribe({
      next: (data) => {
        this.areas = data;
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
    this.purchaseService.get().subscribe({
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


    await this.purchaseService.create({ ...this.compra, idEstatusCompra: '1' });
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
}
