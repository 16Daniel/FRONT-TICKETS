import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ImageModule } from 'primeng/image';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DevolucionesService } from '../../services/devoluciones.service';
import { DevolucionAla } from '../../interfaces/no-conformidad';
import { DevolucionFormComponent } from '../devolucion-form/devolucion-form';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { ProveedorPlaneacion } from '../../interfaces/ProveedorPlaneacion';
import { PlaneacionCatService } from '../../services/planeacion.service';
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from '@angular/forms';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-tabla-devoluciones',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ToolbarModule,
    DialogModule, ConfirmDialogModule, ToastModule, ImageModule,
    DevolucionFormComponent, FormsModule, CalendarModule,
    DropdownModule
],
  providers: [ConfirmationService, MessageService],
  templateUrl: './tabla-devoluciones.html'
})
export default class tablaDevolucionesComponent implements OnInit {
  private devolucionesService = inject(DevolucionesService);
  private confirmationService = inject(ConfirmationService);
  private planeacionService = inject(PlaneacionCatService);
  public catproveedores:ProveedorPlaneacion[] = []; 
  private messageService = inject(MessageService);

  devoluciones: DevolucionAla[] = [];
  displayModal = false;
  selectedDevolucion: DevolucionAla | null = null;
  catStatus:string[] = ['TO DO','WORKING','PAUSE','DONE'];
  public sucursales: Sucursal[] = [];
  public sucursal:string = '';
  public sucursalfiltro: Sucursal | undefined;
  usuario: Usuario;
  fechaini:Date|undefined;
  fechafin:Date|undefined; 
  public estatusfiltro:string = '';

  constructor(public cdr: ChangeDetectorRef,private branchesService: BranchesService)
  {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }
  ngOnInit(): void {
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
    this.getProveedores(); 
    this.obtenerSucursales(); 
    this.devolucionesService.getDevoluciones().subscribe(data => {
      this.devoluciones = data;
      this.cdr.detectChanges();
      Swal.close(); 
    });
  }

  getProveedores()
  {
     this.planeacionService.getCatProveedores().subscribe(data => {
      this.catproveedores = data;
      this.cdr.detectChanges();
      Swal.close(); 
    });
  }

   obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.sucursal = this.usuario.sucursales[0].id; 
        this.cdr.detectChanges();
      },
      error: (error) => {

      },
    });
  }

  openNew() {
    this.selectedDevolucion = null;
    this.displayModal = true;
  }

  editDevolucion(dev: DevolucionAla) {
    this.selectedDevolucion = { ...dev };
    this.displayModal = true;
  }

  deleteDevolucion(dev: DevolucionAla) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el reporte de ${dev.proveedor}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.devolucionesService.deleteDevolucion(dev);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro eliminado' });
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el registro' });
        }
      }
    });
  }

  onSaveCompleted() {
    this.displayModal = false;
    this.filtrar(); 
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Guardado correctamente' });
  }

  getDate(fecha:Timestamp)
  {
    return fecha.toDate(); 
  }

  getNombreProveedor(cod:string):string
  {
    let nombre:string = '';
    let temp = this.catproveedores.filter(x=>x.codproveedor == parseInt(cod)); 
    if(temp.length>0){ nombre = temp[0].nombre;}
    return nombre; 
  }

    getNombreSucursal(id:string):string
  {
    let nombre:string = '';
    let temp = this.sucursales.filter(x=>x.id == id); 
    if(temp.length>0){ nombre = temp[0].nombre;}
    return nombre; 
  }

  filtrar()
  {  
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
    this.devolucionesService.filtrarDevoluciones(this.fechaini,this.fechafin,this.sucursalfiltro?.id,this.estatusfiltro).subscribe(data => {
      this.devoluciones = data;
      this.cdr.detectChanges();
      Swal.close(); 
    });
    //  this.datafiltro = [...this.devoluciones];
    // if(this.fechaReporte != undefined)
    //   {
    //       const añoSel = this.fechaReporte.getFullYear();
    //             const mesSel = this.fechaReporte.getMonth(); 
    //             const diaSel = this.fechaReporte.getDate();

    //             this.datafiltro = this.datafiltro.filter(item => {
    //               const fechaReg = item.fechaReporte.toDate();
    //               return fechaReg.getFullYear() === añoSel &&
    //                     fechaReg.getMonth() === mesSel &&
    //                     fechaReg.getDate() === diaSel;
    //             });
    //   }
    // if(this.fechaEntrega != undefined)
    //   {
    //        const añoSel = this.fechaEntrega.getFullYear();
    //             const mesSel = this.fechaEntrega.getMonth(); 
    //             const diaSel = this.fechaEntrega.getDate();

    //             this.datafiltro = this.datafiltro.filter(item => {
    //               const fechaReg = item.fechaEntrega.toDate();
    //               return fechaReg.getFullYear() === añoSel &&
    //                     fechaReg.getMonth() === mesSel &&
    //                     fechaReg.getDate() === diaSel;
    //             });
    //   }
    //   if(this.sucursalfiltro != undefined)
    //   {
    //       this.datafiltro = this.datafiltro.filter(x=>x.sucursal == this.sucursalfiltro!.id); 
    //   }
  }
}