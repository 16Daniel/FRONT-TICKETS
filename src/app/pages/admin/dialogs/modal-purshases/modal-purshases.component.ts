import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';

import { Compra } from '../../../../models/compra.model';
import { Area } from '../../../../models/area.model';
import { EstatusCompra } from '../../../../models/estatus-compras.model';
import { Sucursal } from '../../../../models/sucursal.model';
import { PurchaseService } from '../../../../services/purchase.service';
import { StatusPurchaseService } from '../../../../services/status-purchase.service';
import { AreasService } from '../../../../services/areas.service';
import { BranchesService } from '../../../../services/branches.service';
import { DatesHelperService } from '../../../../helpers/dates-helper.service';
import { UsersService } from '../../../../services/users.service';
import { Usuario } from '../../../../models/usuario.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-modal-purshases',
  standalone: true,
  imports: [DialogModule, TableModule, CommonModule, DropdownModule, FormsModule, ButtonModule],
  templateUrl: './modal-purshases.component.html',
  styleUrl: './modal-purshases.component.scss'
})
export class ModalPurshasesComponent {
  @Input() mostrarModal: boolean = false;
  @Input() idArea: string = '';
  @Output() closeEvent = new EventEmitter<boolean>();

  compras: Compra[] = [];
  comprasFiltradas: Compra[] = [];
  areas: Area[] = [];
  estatus: EstatusCompra[] = [];
  sucursales: Sucursal[] = [];
  usuariosHelp: Usuario[] = [];

  //filtros
  idEstado: string = '';
  idSucursal: string = '';

  constructor(
    private purchaseService: PurchaseService,
    private statusPurchaseService: StatusPurchaseService,
    private cdr: ChangeDetectorRef,
    private areasService: AreasService,
    private branchesService: BranchesService,
    public datesHelper: DatesHelperService,
    private usersService: UsersService,
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.obtenerAreas();
    this.obtenerCompras();
    this.obtenerEstatus();
    this.obtenerUsuariosHelp();
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
    this.purchaseService.getByArea(this.idArea).subscribe({
      next: (data) => {
        this.compras = data;
        this.comprasFiltradas = this.compras;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerUsuariosHelp() {
    this.usersService.get().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.cdr.detectChanges();
      },
    });
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

  async actualizaCompra(compra: Compra) {
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

    await this.purchaseService.update(compra, compra.id!);
    Swal.close();
    Swal.fire({
      title: "OK",
      text: "COMPRA SOLICITADA!",
      icon: "success",
      customClass: {
        container: 'swal-topmost'
      }
    }); this.cdr.detectChanges();
  }

  getColorEstatus(idEstatusCompra: string): string {
    const estatus = this.estatus.find(e => e.id === idEstatusCompra);
    return estatus ? estatus.color : '#ffffff';
  }


  obtenerNombreResponsable(id: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.id == id);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  buscar() {
    this.comprasFiltradas = this.compras.filter(compra => {
      return (!this.idSucursal || this.idSucursal == compra.idSucursal) &&
        (!this.idEstado || this.idEstado == compra.idEstatusCompra)
    })
  }
}
