import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { InventarioService } from '../../../services/inventario.service';
import { Inventario, InvModel } from '../../../models/inventario.model';
import { Usuario } from '../../../models/usuario.model';
import Swal from 'sweetalert2';
import { TableModule } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UbicacionesInventario } from "../dialogs/ubicaciones-inventario/ubicaciones-inventario.component";
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-captura-inventario-diario',
  standalone: true,
  imports: [CommonModule, TableModule, FormsModule, UbicacionesInventario,ConfirmDialogModule],
  providers:[ConfirmationService,DatePipe],
  templateUrl: './captura-inventario-diario.component.html',
  styleUrl: './captura-inventario-diario.component.scss',
})
export default class CapturaInventarioDiarioComponent implements OnInit {
public catArticulos:Inventario[] = []; 
public catArticulosTodo:Inventario[] = []; 
public filtroArticulo:string = '';  
public usuario:Usuario;
public modalubicaciones:boolean = false; 
public idSucursal:number|undefined;
public codArticulo:number = 0;
public descripcion:string = ""; 
public jdata:string|null; 
public capturarInv:boolean = false; 
public itemumedida:string = ""; 
public today = new Date();
public createDate = '';
public turnoMatutino:boolean = false; 

  constructor(private invServ:InventarioService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    public datepipe: DatePipe,
  )
  {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    //this.idSucursal = this.usuario.sucursales[0].idFront!; 
    this.idSucursal = 2; // pruebas 
      let nombreItem = "rwtkInventarioUbicaciones"+this.idSucursal;
     this.jdata = localStorage.getItem(nombreItem);   

    // setInterval(() => {
    //   if(this.validarHorario(22,0,1,0))
    //     {
    //       this.turnoMatutino = false; 
    //     }
    // }, 1000);
  }

  ngOnInit(): void {  this.validarCaptura(); }

  validarCaptura()
  {
    Swal.showLoading(); 
    this.invServ.validarCaptura(this.idSucursal!).subscribe({
      next: (data) => {
        let invTeorico:boolean = data.capturarInv;  
        if((invTeorico && this.validarHorario(7,0,11,0)) || (invTeorico == false && this.validarHorario(22,0,1,0)))
          {
            this.obtenerArticulos();
            this.capturarInv = true;
          } else 
            {
              this.capturarInv = false; 
               Swal.close();
              this.cdr.detectChanges(); 
            }

               this.capturarInv = true;
                this.obtenerArticulos();
      },   
      error: (error) => {
        console.log(error);
        Swal.close();
         Swal.fire("Oops...", "Error al procesar la solicitud", "error");
      },
    });
  }



  obtenerArticulos()
  {
    Swal.showLoading(); 
    
    if(this.turnoMatutino == true)
      {
         this.invServ.obtenerArticulos(this.idSucursal!).subscribe({
            next: (data) => {
              this.catArticulos = data;
              for(let item of this.catArticulos)
                {
                  item.validado = false; 
                  item.intentos = 0; 
                }
              this.catArticulosTodo = data; 
              this.catArticulos.sort((a:any, b:any) => a.orden - b.orden);
              Swal.close();
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.log(error);
              Swal.close();
              Swal.fire("Oops...", "Error al obtener los artículos", "error");
            },
          });
      }else
        {
           this.invServ.obtenerArticulosV(this.idSucursal!).subscribe({
              next: (data) => {
                this.catArticulos = data;
                for(let item of this.catArticulos)
                  {
                    item.validado = false; 
                    item.intentos = 0; 
                  }
                this.catArticulosTodo = data; 
                this.catArticulos.sort((a:any, b:any) => a.orden - b.orden);
                Swal.close();
                this.cdr.detectChanges();
              },
              error: (error) => {
                console.log(error);
                Swal.close();
                Swal.fire("Oops...", "Error al obtener los artículos", "error");
              },
            });
        }

  }

  filtrararticulo()
  {
    if(this.filtroArticulo != '')
      {
        this.catArticulos = this.catArticulosTodo.filter(x=> x.descripcion.toLocaleLowerCase().includes(this.filtroArticulo.toLocaleLowerCase()));
         this.catArticulos.sort((a:any, b:any) => a.orden - b.orden);
      } else 
        {
          this.catArticulos = this.catArticulosTodo; 
           this.catArticulos.sort((a:any, b:any) => a.orden - b.orden);
         }
  }

abrirModalUbicaciones(codart:number,nombre:string,umedida:string)
{
  this.codArticulo = codart; 
  this.descripcion = nombre; 
  this.itemumedida = umedida; 
  this.modalubicaciones = true; 
}

getCaptura(codArt:number):number
{
  let total:number = 0
  if(this.jdata != null)
    {
      let ubicaciones:any[] = JSON.parse(this.jdata); 
      for(let item of ubicaciones.filter(x=> x.codArticulo == codArt))
        {
          total = total + item.uds; 
        }
    }
  return total; 
}

actualizarUbicaciones()
{
  let nombreItem = "rwtkInventarioUbicaciones"+this.idSucursal;
     this.jdata = localStorage.getItem(nombreItem); 
}

  // validar(itemReg:Inventario,captura:number)
  // {
  //   Swal.showLoading(); 
  //   this.invServ.validarStockV(this.idSucursal!,itemReg.codarticulo,captura.toString()).subscribe({
  //     next: (data) => {
  //          debugger
  //           Swal.close();
  //       if (data.success) {
  //         itemReg.intentos = itemReg.intentos!+1; 
  //         itemReg.validado = true;  
  //       }
  //       else {
  //         Swal.fire('DIFERENCIA DE STOCK','HAY UNA DIFERENCIA EN EL STOCK Y TU CONTEO: <BR><br>1.- CUENTA NUEVAMENTE TU STOCK <BR>2.-REVISA QUE TODAS TUS COMPRAS ESTEN CARGADAS EN EL SISTEMAS <BR>3.-REVISA QUE TUS MERMAS ESTEN CARGADAS CORRECTAMENTE','error');
  //         itemReg.intentos = itemReg.intentos!+1; 
  //       }
  //       this.cdr.detectChanges();
  //     },
  //     error: (error) => {
  //       console.log(error);
  //       Swal.close();
  //        Swal.fire("Oops...", "Error al obtner los artículos", "error");
  //     },
  //   });
  // }


ConfirmarGuardar(item:Inventario)
{
  this.confirmationService.confirm({
      header: 'Confirmación',
      message: `Antes de guardar favor de validar que el inventario capturado sea el correcto, ¿desea continuar?`,
      acceptLabel: 'Aceptar', 
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
         this.obtenerDiferencia(item);        
      },
      reject: () => { },
    });
}

obtenerDiferencia(itemReg:Inventario)
{
  Swal.showLoading(); 
 
  if(this.turnoMatutino)
    {
      this.invServ.validarStock(this.idSucursal!,itemReg.codarticulo,this.getCaptura(itemReg.codarticulo).toString()).subscribe({
      next: (data) => {  
         itemReg.diferencia = data.message;
         itemReg.invInicial = (Number(data.message) - this.getCaptura(itemReg.codarticulo))* -1;
         this.Guardar(itemReg);
      },
      error: (error) => {
        console.log(error);
        Swal.close();
         Swal.fire("Oops...", "Error al obtner los artículos", "error");
      },
    });
    } else
      {
          this.invServ.validarStockV(this.idSucursal!,itemReg.codarticulo,this.getCaptura(itemReg.codarticulo).toString()).subscribe({
            next: (data) => {  
              itemReg.diferencia = data.message;
              itemReg.invInicial = (Number(data.message) - this.getCaptura(itemReg.codarticulo))* -1;
              this.Guardar(itemReg);
            },
            error: (error) => {
              console.log(error);
              Swal.close();
              Swal.fire("Oops...", "Error al obtner los artículos", "error");
            },
          });
      }
   
}

Guardar(item:Inventario)
{
    if(this.turnoMatutino)
      {
          this.invServ.regularizar(item.codarticulo,item.codalmacen,this.getCaptura(item.codarticulo)).subscribe({
            next: (data) => {
              this.guardarInv(item); 
            },
            error: (error) => {
              console.log(error);
              Swal.close();
              Swal.fire("Oops...", "Error al obtener los artículos", "error");
            },
          });
      } else
        {
          this.invServ.regularizarV(item.codarticulo,item.codalmacen,this.getCaptura(item.codarticulo)).subscribe({
              next: (data) => {
                this.guardarInv(item); 
              },
              error: (error) => {
                console.log(error);
                Swal.close();
                Swal.fire("Oops...", "Error al obtener los artículos", "error");
              },
            });
        }
}

guardarInv(item:Inventario)
{  
   this.formartDate();
   let data:InvModel = 
   {
     branch: this.idSucursal!,
     invInicial: this.getCaptura(item.codarticulo) - item.diferencia!,
     invReg: this.getCaptura(item.codarticulo),
     diferencia: item.diferencia!,
     intentos: 1,
     articulo: item.descripcion,
     createdBy: 21,
     createdDate: this.createDate,
     updatedBy: 21,
     updatedDate: this.createDate
   } 
    
  this.invServ.addInventario(data).subscribe({
      next: (data) => { 
        Swal.close(); 
        //eliminar ubicaciones 
        this.eliminarUbicaciones(item.codarticulo); 
         Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Guardado corretamente",
          showConfirmButton: false,
          timer: 1500,
          customClass: {
                container: 'swal-topmost'
              }
        });
        this.obtenerArticulos(); 
      },
      error: (error) => {
        console.log(error);
        Swal.close();
         Swal.fire("Oops...", "Error al obtener los artículos", "error");
      },
    });
}

eliminarUbicaciones(codArt:number)
{
   let nombreItem = "rwtkInventarioUbicaciones"+this.idSucursal;
  let jdata = localStorage.getItem(nombreItem); 
  if(jdata != null)
    {
        let ubicacionesActuales:any[] = JSON.parse(jdata); 
        ubicacionesActuales = ubicacionesActuales.filter(x=>x.codArticulo != codArt); 
        jdata = JSON.stringify(ubicacionesActuales); 
        localStorage.setItem(nombreItem,jdata);
    }  
}
  formartDate() {
    // 2022-03-11T17:27:00
    console.log('date', this.today);
    let time = '';
    const hour = this.today.getHours();
    const minute = this.today.getMinutes();
    let hourString = hour.toString();
    let minuteString = minute.toString();
    const date = this.datepipe.transform(this.today, 'yyyy-MM-dd');
    if (hourString.length < 2) {
      hourString = `0${hourString}`;
    }
    if (minuteString.length < 2) {
      minuteString = `0${minuteString}`;
    }
    console.log('hour', hourString);
    console.log('minute', minuteString);
    time = `${hourString}:${minuteString}:00`;
    console.log('date', date);
    this.createDate = `${date}T${time}`;
  }


validarHorario(
    horaInicio: number, 
    minutoInicio: number, 
    horaFin: number, 
    minutoFin: number, 
    horaEspecifica?: Date
): boolean {
    const ahora = horaEspecifica || new Date();
    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
    
    const inicioMinutos = horaInicio * 60 + minutoInicio;
    const finMinutos = horaFin * 60 + minutoFin;
    
    // Si el rango no cruza medianoche
    if (inicioMinutos < finMinutos) {
        return minutosActuales >= inicioMinutos && minutosActuales < finMinutos;
    }
    
    // Si el rango cruza medianoche (como en el caso de 10PM-1AM)
    return minutosActuales >= inicioMinutos || minutosActuales < finMinutos;
}


}
