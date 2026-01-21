import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ModalAgregarMedidaComponent } from '../../dialog/Modal-agregar-medida/Modal-agregar-medida.component';
import { ITproducto } from '../../interfaces/Planecion';
import { PlaneacionService } from '../../services/Planeacion.service';

@Component({
  selector: 'app-diccionario',
  standalone: true,
  imports: [CommonModule, TableModule, ModalAgregarMedidaComponent, FormsModule, InputSwitchModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './Diccionario.component.html',
  styleUrl: './Diccionario.component.scss',
})
export default class DiccionarioComponent implements OnInit {
  public loading: boolean = false;
  public diccionario: ITproducto[] = [];
  public diccionarioFiltro: ITproducto[] = [];
  public modalEditar: boolean = false;
  public itemSel: ITproducto | undefined;

  // filtros
  public filtroCodart: string = "";
  public filtroDescripcion: string = "";
  public filtroReferencia: string = "";
  public filtroNumIdentificacion: string = "";
  public filtroRfc: string = ""
  public filtroProveedor: string = "";
  public filtroPlanecionFalse: boolean = true;
  public filtroPlanecionTrue: boolean = true;

  constructor(public apiserv: PlaneacionService, public cdr: ChangeDetectorRef, private confirmationService: ConfirmationService,) { }

  ngOnInit(): void {
    this.getDiccionario();
  }

  getDiccionario() {
    this.loading = true;
    Swal.showLoading();
    this.apiserv.getDiccionario().subscribe({
      next: data => {
        this.diccionario = data;
        this.diccionarioFiltro = data;
        this.loading = false;
        Swal.close();
        this.cdr.detectChanges();
      },
      error: error => {
        Swal.close();
        console.log(error);
      }
    });

  }

  getDiccionario2() {
    this.loading = true;
    Swal.showLoading();
    this.apiserv.getDiccionario().subscribe({
      next: data => {
        this.diccionario = data;
        this.loading = false;
        Swal.close();
        this.cdr.detectChanges();
      },
      error: error => {
        Swal.close();
        console.log(error);
      }
    });

  }

  abrirModalEditar(item: ITproducto) {
    this.itemSel = item;
    this.modalEditar = true;
  }

  filtrarCodigointerno() {
    if (this.filtroCodart == "") {
      this.diccionarioFiltro = this.diccionario;
    } else {
      this.diccionarioFiltro = this.diccionario.filter(x => x.codarticulo != null && x.codarticulo.includes(this.filtroCodart));
    }
  }

  filtrarDescripcion() {
    if (this.filtroDescripcion == "") {
      this.diccionarioFiltro = this.diccionario;
    } else {
      this.diccionarioFiltro = this.diccionario.filter(x => x.descripcion != null && x.descripcion.toLowerCase().includes(this.filtroDescripcion.toLowerCase()));
    }
  }

  filtrarReferencia() {
    if (this.filtroReferencia == "") {
      this.diccionarioFiltro = this.diccionario;
    } else {
      this.diccionarioFiltro = this.diccionario.filter(x => x.refproveedor != null && x.refproveedor.includes(this.filtroReferencia));
    }
  }

  filtrarNumIdentificacion() {
    if (this.filtroNumIdentificacion == "") {
      this.diccionarioFiltro = this.diccionario;
    } else {
      this.diccionarioFiltro = this.diccionario.filter(x => x.noIdentificacion != null && x.noIdentificacion.toLowerCase().includes(this.filtroNumIdentificacion.toLowerCase()));
    }
  }

  filtrarRfc() {
    if (this.filtroRfc == "") {
      this.diccionarioFiltro = this.diccionario;
    } else {
      this.diccionarioFiltro = this.diccionario.filter(x => x.rfc != null && x.rfc.toLowerCase().includes(this.filtroRfc.toLowerCase()));
    }
  }


  filtrarProveedor() {
    if (this.filtroProveedor == "") {
      this.diccionarioFiltro = this.diccionario;
    } else {
      this.diccionarioFiltro = this.diccionario.filter(x => x.nomProveedor != null && x.nomProveedor.toLowerCase().includes(this.filtroProveedor.toLowerCase()));
    }
  }

  confirmarEliminacion(item: ITproducto) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message:
        '¿Está segur@ que desea eliminar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.eliminar(item.rfc, item.noIdentificacion);
      },
      reject: () => { },
    });
  }

  eliminar(rfc: string, id: string) {
    this.loading = true;
    Swal.showLoading();
    this.apiserv.eliminarRegistro(rfc, id).subscribe({
      next: data => {
        this.loading = false;
        Swal.close();
        this.getDiccionario();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "¡ELIMINADO CORRECTAMENTE!",
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: error => {
        this.loading = false;
        Swal.close();
        console.log(error);
      }
    });
  }

  filtroPlaneacion() {
    this.diccionarioFiltro = [];

    if (this.filtroPlanecionFalse == true) {
      let temp = this.diccionario.filter(x => x.planeacion == false);
      this.diccionarioFiltro.push(...temp);
    }

    if (this.filtroPlanecionTrue == true) {
      let temp = this.diccionario.filter(x => x.planeacion == true);
      this.diccionarioFiltro.push(...temp);
    }
  }

}
