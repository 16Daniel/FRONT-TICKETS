import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';

import { EntregaAceite } from '../../models/aceite.model';
import { Sucursal } from '../../../models/sucursal.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { AceiteService } from '../../services/aceite.service';
import { BranchesService } from '../../../sucursales/services/branches.service';

@Component({
  selector: 'app-branches-oil-trap-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TabViewModule, ToastModule, DialogModule, CalendarModule, ConfirmDialogModule, InputNumberModule, TriStateCheckboxModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './branches-oil-trap-tab.html',
  styleUrl: './branches-oil-trap-tab.scss',
})

export class BranchesOilTrapTab implements OnInit {
  public entregas: EntregaAceite[] = [];
  public entregasH: EntregaAceite[] = [];
  public entregasHTodas: EntregaAceite[] = [];
  public itemEntrega: EntregaAceite | undefined;
  public mostrarModalDevolucion: boolean = false;
  public sucursales: Sucursal[] = [];
  public sucursal: Sucursal | undefined;
  fechaini: Date = new Date();
  fechafin: Date = new Date();
  usuario: Usuario;
  public formCantidad: number = 0;
  public formcomentarios: string = "";
  public loading: boolean = true;
  value: boolean | null = null;
  estatusfiltro: string = "TODO";

  constructor(
    public aceiteService: AceiteService,
    private confirmationService: ConfirmationService,
    public cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private messageService: MessageService) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.obtenerSucursales();

    setInterval(() => {
      this.consultarEntregas();
    }, 60000);
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  consultarEntregas() {
    this.aceiteService.getEntregasTrampaAceite(this.sucursal!.idFront!).subscribe({
      next: (data) => {
        this.entregas = data;
        console.log(this.entregas);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  consultarEntregasH() {
    this.loading = true;
    this.aceiteService.getEntregasH(this.sucursal!.idFront!, this.fechaini, this.fechafin).subscribe({
      next: (data) => {
        this.entregasH = data;
        this.entregasHTodas = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  consultarEntregasTAH() {
    this.loading = true;
    this.aceiteService.getEntregasTAH(this.sucursal!.idFront!, this.fechaini, this.fechafin).subscribe({
      next: (data) => {
        this.entregasH = data;
        this.entregasHTodas = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  abrirModalDevolucion(item: EntregaAceite) {
    this.itemEntrega = item;
    this.mostrarModalDevolucion = true;
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    } catch {
      return tsmp;
    }
  }

  obtenerNombreSucursal(idSucursal: number): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.idFront == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  obtenerSucursales() {
    this.loading = true;
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.sucursal = this.obtenerSucursalporId(this.usuario.sucursales[0].id);
        this.consultarEntregas();
        this.consultarEntregasH();
        this.cdr.detectChanges();
      },
      error: (error) => {

      },
    });
  }

  obtenerSucursalporId(idSucursal: string): Sucursal {
    let sucursal = this.sucursales.filter(x => x.id == idSucursal);
    return sucursal[0];
  }

  confirmacion() {
    if (this.formcomentarios == "") {
      this.showMessage('info', 'info', 'Favor de agregar un comentario');
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmación',
      message: `¿Está seguro que desea guardar la cantidad ingresada?`,
      acceptLabel: 'Aceptar', // 🔥 Cambia "Yes" por "Aceptar"
      rejectLabel: 'Cancelar', // 🔥 Cambia "No" por "Cancelar"
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {

        this.actualizarEntrega();
      },
      reject: () => { },
    });
  }

  actualizarEntrega() {

    this.loading = true;
    this.aceiteService.ActualizarEntregaTrampaAceite(this.itemEntrega!.id, this.formCantidad, this.formcomentarios).subscribe({
      next: (data) => {
        this.mostrarModalDevolucion = false;
        this.showMessage('success', 'Success', 'Guardado correctamente');
        this.formCantidad = 0;
        this.formcomentarios = "";
        this.sucursal = this.obtenerSucursalporId(this.usuario.sucursales[0].id);
        this.consultarEntregas();
        this.consultarEntregasH();
        this.cdr.detectChanges();
      },
      error: (error) => {

      },
    });
  }

  cambiarFIltro() {
    if (this.value == null) {
      this.entregasH = [...this.entregasHTodas];
      this.estatusfiltro = "TODO";
    }

    if (this.value == true) {
      this.entregasH = this.entregasHTodas.filter(x => x.status == 3);
      this.estatusfiltro = "FINALIZADO";
    }

    if (this.value == false) {
      this.entregasH = this.entregasHTodas.filter(x => x.status == 2);
      this.estatusfiltro = "POR VALIDAR";
    }
  }
}
