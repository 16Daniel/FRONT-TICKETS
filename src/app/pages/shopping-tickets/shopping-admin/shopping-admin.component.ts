import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ShoppingService } from '../../../services/shopping.service';
import { FormsModule } from '@angular/forms';
import { ProveedoresComponent } from "./dialogs/proveedores/proveedores.component";
import { BranchesService } from '../../../services/branches.service';
import { Sucursal } from '../../../models/sucursal.model';
import { DropdownModule } from 'primeng/dropdown';
import { AdministracionCompra, ArticuloCompra, Proveedor } from '../../../models/AdministracionCompra';
import Swal from 'sweetalert2';
import { Timestamp } from '@angular/fire/firestore';
import { SubirFacturaComponent } from "./dialogs/Subir-factura/Subir-factura.component";
import { AgregarCompraComponent } from "./dialogs/agregar-compra/agregar-compra.component";
import { ArchivosComponent } from "./dialogs/Archivos/Archivos.component";
import { DetallesComponent } from "./dialogs/Detalles/Detalles.component";
import { SideMenuComponent } from "../../../shared/side-menu/side-menu.component";
import { AdminComprasChatComponent } from "./dialogs/admin-compras-chat/admin-compras-chat.component";
import { Usuario } from '../../../models/usuario.model';
import { CalendarModule } from 'primeng/calendar';
import { GraficaAdminComprasComponent } from "./components/grafica-admin-compras/grafica-admin-compras.component";
@Component({
  selector: 'app-shopping-admin',
  standalone: true,
  imports: [CommonModule, DialogModule, TableModule, FormsModule, ProveedoresComponent,
    DropdownModule, SubirFacturaComponent, AgregarCompraComponent, ArchivosComponent,
    DetallesComponent, SideMenuComponent, AdminComprasChatComponent, CalendarModule, GraficaAdminComprasComponent],
  templateUrl: './shopping-admin.component.html',
  styleUrl:'./shopping-admin.component.scss'
})
export default class ShoppingAdminComponent implements OnInit {
public visible:boolean = false; 
public catTipoCompra:any[] = []; 
public catProveedores:Proveedor[] = [];  
public modalProveedores:boolean = false; 
public modalFactura:boolean = false; 
public modalDetalles:boolean = false; 
public sucursales: Sucursal[] = [];
public catStatusCompra:any[] = [{id:'1',nombre:'EN GESTIÓN'},{id:'0',nombre:'CANCELADO'},{id:'2',nombre:'COMPRADO'},{id:'3',nombre:'ENTREGADO'},{id:'4',nombre:'EN DEVOLUCIÓN'},{id:'5',nombre:'OTRO'}]
public catStatusPago:any[] = [{id:'1',nombre:'POR PAGAR'},{id:'2',nombre:'PAGADO'}]
public filtrocatStatusCompra:any[] = [{id:'-1',nombre:'TODO'},{id:'1',nombre:'EN GESTIÓN'},{id:'0',nombre:'CANCELADO'},{id:'2',nombre:'COMPRADO'},{id:'3',nombre:'ENTREGADO'},{id:'4',nombre:'EN DEVOLUCIÓN'},{id:'5',nombre:'OTRO'}]
public filtrocatStatusPago:any[] = [{id:'-1',nombre:'TODO'},{id:'1',nombre:'POR PAGAR'},{id:'2',nombre:'PAGADO'}]
public regcompras:AdministracionCompra[] = []; 
public itemReg:AdministracionCompra|undefined; 
public fechaReg:Date = new Date(); 
public modalArchivos:boolean = false;
public modalChat:boolean = false;
public usuario:Usuario;
public idAdmin:string = 'pclOBh7sMdziimACOc1w';
public filtroFechaIni:Date|undefined;
public filtroFechaFin:Date|undefined;
public filtroStatus:string = "-1";
public filtroStatusPago:string = "1"; 
public filtroSucursal: Sucursal|undefined;
public filtroTipo:string = "-1"; 
public filtrocatTipoCompra:any[] = []; 
constructor(
    private shopServ:ShoppingService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    ){  this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }
  ngOnInit(): void 
  {
    this.obtenerTipoCompras(); 
    this.obtenerProveedores(); 
    this.obtenerSucursales();
    if(this.usuario.id == this.idAdmin)
      {
        this.obtenerCompras(); 
      } else
        {
          this.obtenerComprasUsuario();
        }
   }
   
   obtenerCompras()
   {
        this.shopServ.getCompras().subscribe({
      next: (data) => {
        this.regcompras = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
   }

     obtenerComprasUsuario()
   {
        this.shopServ.getComprasUsuario(this.usuario.id).subscribe({
      next: (data) => {
        this.regcompras = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
   }

   obtenerComprasFiltro()
   {  
      this.regcompras = []; 
    Swal.showLoading(); 
      let idsuc = this.filtroSucursal == undefined ? '': this.filtroSucursal.id; 
      let idusuario = this.usuario.id == this.idAdmin ? '': this.usuario.id;
        this.shopServ.getComprasFiltro(this.filtroFechaIni,this.filtroFechaFin,this.filtroStatus,this.filtroStatusPago,idsuc,idusuario,this.filtroTipo).subscribe({
      next: (data) => {
        this.regcompras = data;
        Swal.close(); 
        this.cdr.detectChanges();
      },
      error: (error) => {
        Swal.close(); 
        console.log(error);
      },
    });
   }

  abrirModal()
  {
    this.visible = true; 
  }
  abrirModalChat(item:AdministracionCompra)
  { 
    this.itemReg = item; 
    this.modalChat = true; 
  }
    abrirModalArchivos(item:AdministracionCompra)
  { 
    this.itemReg = item; 
    this.modalArchivos = true; 
  }
  abrirModalDetalles(item:AdministracionCompra)
  { 
    this.itemReg = item; 
    this.modalDetalles = true; 
  }
  obtenerTipoCompras()
  {
     this.shopServ.getCatTipo().subscribe({
      next: (data) => {
        this.catTipoCompra = data;
        this.filtrocatTipoCompra = [...this.catTipoCompra]; 
        this.filtrocatTipoCompra.unshift({id:"-1",nombre:'TODO'})
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }  

  obtenerProveedores()
  {
    this.shopServ.getProveedores().subscribe({
      next: (data) => {
        this.catProveedores= data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

    obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
       // this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }


abrirModalProveedores()
{
  this.modalProveedores = true;
  this.cdr.detectChanges();  
}

abrirModalFactura(item:AdministracionCompra)
{
  this.itemReg = item;
  this.modalFactura = true;
}

obtenerFecha(value:Timestamp):Date
{
  return value.toDate(); 
}

obtenerNombreArticulos(articulos:ArticuloCompra[]):string
{
    let valor = ""; 

    for(let item of articulos)
      {
        valor = valor + item.art + ", "; 
      }
     valor = valor.substring(0,valor.length-2);    
  return valor; 
}

obtenerNombreSucursal(idSucursal:string):string
{
    let nombre = "";
    let sucursal = this.sucursales.filter(x=> x.id == idSucursal)[0]; 
    
    if(sucursal != undefined){ nombre = sucursal.nombre; }
    return nombre; 
}

  downloadPdfDirect(pdfUrl: string) {
  window.open(pdfUrl, '_blank');
}

obtenerNombreEstatus(id:string):string
{
  return this.catStatusCompra.filter(x=> x.id == id).length>0 ? this.catStatusCompra.filter(x=> x.id == id)[0].nombre : '';   
}
obtenerNombreEstatusPago(id:string):string
{
  return this.catStatusPago.filter(x=> x.id == id).length>0 ? this.catStatusPago.filter(x=> x.id == id)[0].nombre : '';   
}


  verificarChatNoLeido(ticket:AdministracionCompra) {
    const participantes = ticket.participantesChat.sort(
      (a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido
    );
    const participante = participantes.find(
      (p) => p.idUsuario === this.usuario.id
    );

    if (participante) {
      const ultimoComentarioLeido = this.modalChat
        ? ticket.comentarios.length
        : participante.ultimoComentarioLeido;
      const comentarios = ticket.comentarios;

      // Si el último comentario leído es menor que la longitud actual de los comentarios
      return comentarios.length > ultimoComentarioLeido;
      
    }

    return false;
  }

obtenerTotalCompras(articulos:ArticuloCompra[]):number
{
  let total = 0;
  for(let item of articulos)
    {
      total = total + (item.precio * item.uds);
    }
  return total;
}

}
