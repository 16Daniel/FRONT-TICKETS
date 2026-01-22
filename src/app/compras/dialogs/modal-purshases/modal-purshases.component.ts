import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ModalVisorVariasImagenesComponent } from '../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import { Compra } from '../../interfaces/compra.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { PurchaseService } from '../../services/purchase.service';
import { StatusPurchaseService } from '../../services/status-purchase.service';
import { AreasService } from '../../../areas/services/areas.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { ModalPurchasesImgsUploaderComponent } from '../modal-purchases-imgs-uploader/modal-purchases-imgs-uploader.component';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { EstatusCompra } from '../../interfaces/estatus-compras.model';

@Component({
  selector: 'app-modal-purshases',
  standalone: true,
  imports: [
    DialogModule,
    TableModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    ButtonModule,
    ModalPurchasesImgsUploaderComponent,
    ModalVisorVariasImagenesComponent
  ],
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
  usuariosFiltro: Usuario[] = [];

  //filtros
  idEstado: string = '';
  idSucursal: string = '';
  idUsuario: string = '';

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
    public datesHelper: DatesHelperService,
    private usersService: UsersService,
  ) { }

  ngOnInit(): void {
    this.areas = this.areasService.areas;
    this.obtenerSucursales();
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
    this.usuariosHelp = this.usersService.usuarios;
    this.usuariosFiltro = this.usuariosHelp.filter(x => x.idArea == this.idArea);
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
        (!this.idEstado || this.idEstado == compra.idEstatusCompra) &&
        (!this.idUsuario || this.idUsuario == compra.idUsuario)
    })
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
