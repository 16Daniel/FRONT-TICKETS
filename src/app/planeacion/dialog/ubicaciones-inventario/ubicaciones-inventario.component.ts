import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputSwitchModule } from 'primeng/inputswitch';
import Swal from 'sweetalert2';

import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-ubicaciones-inventario',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ToastModule,
    FormsModule,
    TableModule,
    CalendarModule,
    ConfirmDialogModule,
    InputSwitchModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ubicaciones-inventario.component.html',
  styleUrl: './ubicaciones-inventario.component.scss',
})

export class UbicacionesInventario implements OnInit {
  @Input() visible: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Output() eventoDeGuardado = new EventEmitter<void>();
  @Input() descripcion: string = "";
  @Input() codarticulo: number | undefined;
  @Input() idfront: number | undefined;
  @Input() umedida: string = "";
  public total: number = 0;
  public ubicaciones: any[] = [];
  public userdata: any;
  public isGreen: boolean = false;
  public vista: number = 1;
  public vistaPorcentajes: boolean = false;
  public loading: boolean = false;
  public presentaciones: number[] = [];

  constructor(private invServ: InventarioService) { }

  ngOnInit(): void {
    this.obtenerPresentaciones();
    let nombreItem = "rwtkInventarioUbicaciones" + this.idfront;
    let nombreItemV = "rwtkInventarioUbicacionesV" + this.idfront + this.codarticulo;
    let jdata = localStorage.getItem(nombreItem);
    let vista = localStorage.getItem(nombreItemV);
    if (vista != null) { this.vistaPorcentajes = vista == '0' ? false : true; }
    if (jdata != null) {
      this.ubicaciones = [];
      this.ubicaciones = JSON.parse(jdata);
      this.ubicaciones = this.ubicaciones.filter(x => x.codArticulo == this.codarticulo);
      if (this.ubicaciones.length == 0) {
        this.addubicacion();
      }
      this.gettotal();
    }
  }

  obtenerPresentaciones() {
    this.loading = true;
    this.invServ.obtenerPresentaciones(this.codarticulo!).subscribe({
      next: (data) => {
        this.presentaciones = data;
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
        Swal.fire("Oops...", "Error al procesar la solicitud", "error");
      },
    });
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  addubicacion() {
    let index = this.ubicaciones.length + 1;
    this.ubicaciones.push({ codArticulo: this.codarticulo, ubicacion: 'Ubicación ' + index, uds: 0, p1: 0, p2: 0, p3: 0, p4: 0, presentacion: '-1' })
  }

  borrar(index: number) {
    if (index > -1) {
      this.ubicaciones.splice(index, 1);
    }
    this.gettotal();
  }

  gettotal() {
    this.total = 0
    if (this.ubicaciones.length > 0) {
      for (let item of this.ubicaciones) {
        this.total = this.total + item.uds;
      }
    }

  }

  calcularUbicacion(item: any) {
    let presentacion: number = item.presentacion;
    let uds: number = 0;
    uds = uds + (item.p1 * presentacion);
    uds = uds + ((item.p2 * presentacion) * .75);
    uds = uds + ((item.p3 * presentacion) * .5);
    uds = uds + ((item.p4 * presentacion) * .25);
    item.uds = uds;
    this.gettotal();
  }

  guardarcalculoinv() {
    this.isGreen = true;
    let nombreItem = "rwtkInventarioUbicaciones" + this.idfront;
    let jdata = localStorage.getItem(nombreItem);
    if (jdata != null) {
      let ubicacionesActuales: any[] = JSON.parse(jdata);
      ubicacionesActuales = ubicacionesActuales.filter(x => x.codArticulo != this.codarticulo);
      for (let itemUb of this.ubicaciones) {
        ubicacionesActuales.push(itemUb);
      }
      jdata = JSON.stringify(ubicacionesActuales);
    } else {
      jdata = JSON.stringify(this.ubicaciones);
    }
    localStorage.setItem(nombreItem, jdata);
    this.eventoDeGuardado.emit();

    Swal.fire({
      icon: "success",
      title: "Guardado corretamente",
      html: `
    El conteo del inventario del artículo: <strong>${this.descripcion}</strong> se actualizó a <strong>${this.total} ${this.umedida}</strong>
    <p></p>
  `,
      showConfirmButton: true,
      customClass: {
        container: 'swal-topmost'
      }
    });

  }

  incrementarInv(item: any, pos: number) {
    if (pos == 1) {
      item.p1 = item.p1 + 1;
    }
    if (pos == 2) {
      item.p2 = item.p2 + 1;
    }
    if (pos == 3) {
      item.p3 = item.p3 + 1;
    }
    if (pos == 4) {
      item.p4 = item.p4 + 1;
    }

    this.calcularUbicacion(item);
  }

  restarInv(item: any, pos: number) {
    if (pos == 1) {
      if (item.p1 > 0) {
        item.p1 = item.p1 - 1;
      }
    }
    if (pos == 2) {
      if (item.p2 > 0) {
        item.p2 = item.p2 - 1;
      }
    }
    if (pos == 3) {
      if (item.p3 > 0) {
        item.p3 = item.p3 - 1;
      }
    }
    if (pos == 4) {
      if (item.p4 > 0) {
        item.p4 = item.p4 - 1;
      }
    }

    this.calcularUbicacion(item);
  }

  cambiarEstado(nuevoValor: boolean) {

    // Ejecuta tu lógica aquí
    Swal.fire({
      title: "AL CAMBIAR DE VISTA LA INFORMACION INGRESADA SE PERDERÁ",
      text: "¿DESEA CONTINUAR?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "CANCELAR",
      confirmButtonText: "SI",
      customClass: {
        container: 'swal-topmost'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        for (let item of this.ubicaciones) {
          item.uds = 0;
          item.p1 = 0;
          item.p2 = 0;
          item.p3 = 0;
          item.p4 = 0;
        }
        this.gettotal();
        let nombreItemV = "rwtkInventarioUbicacionesV" + this.idfront + this.codarticulo;
        localStorage.setItem(nombreItemV, this.vistaPorcentajes == true ? '1' : '0');
      } else {
        this.vistaPorcentajes = !nuevoValor;
        let nombreItemV = "rwtkInventarioUbicacionesV" + this.idfront + this.codarticulo;
        localStorage.setItem(nombreItemV, this.vistaPorcentajes == true ? '1' : '0');
      }
    });

  }
}
