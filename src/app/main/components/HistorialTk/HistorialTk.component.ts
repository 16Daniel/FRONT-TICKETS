import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { HttpClient } from '@angular/common/http';
import { Firestore, namedQuery } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { ApiService } from '../../../Services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sucursal } from '../../../Interfaces/Sucursal';
import { StatusTK, Ticket, TicketDBH } from '../../../Interfaces/ticket';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Proveedor } from '../../../Interfaces/Proveedor';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Notificacion } from '../../../Interfaces/Notificacion';
import { UsuarioDB } from '../../../Interfaces/Usuario';
import { Calendar, CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-historial-tk',
  standalone: true,
    imports: [
      TableModule,
      DialogModule,
      DropdownModule,
      FormsModule,
      EditorModule,
      ToastModule,
      CommonModule,
      TagModule,
      ConfirmDialogModule,
      OverlayPanelModule,
      CalendarModule
  ],
    providers:[MessageService,ConfirmationService],
  templateUrl: './HistorialTk.component.html',
})
export default class HistorialTkComponent implements OnInit {
public modalagregart:boolean = false; 
public formdepto:any; 
public formprov:any;
public formcategoria:any; 
public formnomsolicitante:any;  
public formdescripcion:string = ""; 
public formprioridad:any; 
public formstatussuc:any; 
public catsucursales:Sucursal[] = []; 
public catproveedores:Proveedor[] = []; 
public catcategorias:Sucursal[] = []; 
public catStatusT:StatusTK[] = []; 
public arr_tickets:TicketDBH[]= [];
public subscriptiontk:Subscription|undefined;
public modalticket:boolean = false; 
public modalcomentarios:boolean = false; 
public modaladdcomentario:boolean = false; 
public formcomentario:string = ""; 
public userdata:any; 
public sucursal:Sucursal|undefined; 
public catusuarioshelp:UsuarioDB[] = []; 
public selectedtk:TicketDBH|undefined; 
public all_arr_tickets:TicketDBH[]= [];
public modalfiltros:boolean = false; 
public filterPrioridad:any|undefined; 
public filterarea:any|undefined;
public filtercategoria:any|undefined;
public filterstatus:any|undefined; 

public fechaini:Date = new Date(); 
public fechafin:Date = new Date(); 

constructor(private http: HttpClient, private firestore:Firestore,private auth:Auth, private apiserv:ApiService, public cdr:ChangeDetectorRef,
  private messageService: MessageService, private confirmationService: ConfirmationService) 
{
  this.userdata = JSON.parse(localStorage.getItem("rwuserdatatk")!);
  let idu =this.userdata.uid;; 
  console.log(this.userdata);

  this.getcatStatust();
this.getDepartamentos(); 
this.getProveedores();
this.getusuarioshelp(); 
this.getTicketsUser(idu);
  
  this.sucursal = this.userdata.sucursales[0]; 
  this.formdepto = this.sucursal; 

 }
  ngOnInit(): void
   {
   
    }

  openadd()
  {
    this.modalagregart = true; 
  }

  async enviartk():Promise<void>
  {
    let idu = this.userdata.uid; 
    let comtk:any[] = []; 
    let tk:Ticket = 
    {
    fecha: new Date(),
    idsucordpto:this.formdepto.id,
    statusSuc:null,
    idproveedor:this.formprov.id,
    idcategoria:this.formcategoria.id,
    decripcion:this.formdescripcion, 
    solicitante:this.formnomsolicitante,
    prioridadsuc:this.formprioridad.name,
    prioridadProv:null, 
    status:'1', 
    responsable:this.getResponsabletk(), 
    comentarios:comtk, 
    fechafin:null, 
    duracion:null, 
    tiposoporte:null ,
    iduser: idu,
    nombreCategoria:this.formcategoria.nombre
    };
    debugger
    const docid = await this.apiserv.addticket(tk); 
    this.showMessage('success','Success',"ENVIADO CORRECTAMENTE"); 

    let dataNot:Notificacion= 
    {
       titulo: 'NUEVO TICKET',
       mensaje:'SE GENERÓ UN NUEVO TICKET PARA LA SUCURSAL: '+this.formdepto.nombre,
       uid: 'jBWVcuCQlRh3EKgSkWCz6JMYA9C2',
       fecha: new Date(),
       abierta: false,
       idtk: docid,
       notificado:false 
    } 

    let idn = this.apiserv.addNotifiacion(dataNot); 

    this.modalagregart = false; 
    this.formdescripcion = ''; 
    this.formnomsolicitante = ''; 
    this.formcategoria = undefined; 
    this.formstatussuc = undefined; 
    this.formprov = undefined; 
    this.formprioridad = undefined; 
  }

   showMessage(sev:string,summ:string,det:string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
  
  getDepartamentos()
  {
    this.apiserv.getSucursalesDepto().subscribe({
      next: data => {
         this.catsucursales = data; 
       this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
         this.showMessage('error',"Error","Error al procesar la solicitud");
      }
  });
  } 

  getProveedores()
  {
    this.apiserv.getProveedores().subscribe({
      next: data => {
         this.catproveedores = data;
       this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
         this.showMessage('error',"Error","Error al procesar la solicitud");
      }
  });
  } 

  getcatStatust()
  {
    this.apiserv.getCatStatus().subscribe({
      next: data => {
         this.catStatusT = data; 
       this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
         this.showMessage('error',"Error","Error al procesar la solicitud");
      }
  });
  } 

  changeprov()
  {
    if(this.formprov != undefined)
      {
        this.apiserv.getCategoriasprov(this.formprov.id).subscribe({
          next: data => {
             this.catcategorias = data; 
           this.cdr.detectChanges();
          },
          error: error => {
             console.log(error);
             this.showMessage('error',"Error","Error al procesar la solicitud");
          }
      });
      }
  }

  changeprovFilter()
  {
    if(this.filterarea != undefined)
      {
        this.apiserv.getCategoriasprov(this.filterarea.id).subscribe({
          next: data => {
             this.catcategorias = data; 
           this.cdr.detectChanges();
          },
          error: error => {
             console.log(error);
             this.showMessage('error',"Error","Error al procesar la solicitud");
          }
      });
      }
  }


async getTicketsUser(userid:string):Promise<void>
{
  
  this.subscriptiontk = this.apiserv
    .getHistorialtickets(this.fechaini,this.fechafin,userid,this.userdata.idRol)
    .subscribe({
      next: (data) => {
        this.arr_tickets = data;
        let arr_temp:TicketDBH[] = []; 
        let temp1:TicketDBH[] = this.arr_tickets.filter(x => x.prioridadsuc == 'PÁNICO');
        let temp2:TicketDBH[] = this.arr_tickets.filter(x => x.prioridadsuc == 'ALTA');
        let temp3:TicketDBH[] = this.arr_tickets.filter(x => x.prioridadsuc == 'MEDIA');
        let temp4:TicketDBH[] = this.arr_tickets.filter(x => x.prioridadsuc == 'BAJA');
        
        temp1 = temp1.sort(
          (a, b) => b.fecha.getTime() - a.fecha.getTime()
          );

          temp2 = temp2.sort(
            (a, b) => b.fecha.getTime() - a.fecha.getTime()
            );
      
            temp3 = temp3.sort(
              (a, b) => b.fecha.getTime() - a.fecha.getTime()
              );

              temp4 = temp4.sort(
                (a, b) => b.fecha.getTime() - a.fecha.getTime()
                );
        arr_temp = [...temp1,...temp2,...temp3,...temp4]; 
        this.all_arr_tickets = [...arr_temp];
      this.arr_tickets = arr_temp;

          this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.error('Error al escuchar los tickets:', error);
      },
    });
}


  ngOnDestroy() {
    if(this.subscriptiontk != undefined)
      {
        this.subscriptiontk.unsubscribe();
      }

  }

  buscartk()
  {
   
  this.subscriptiontk = this.apiserv
  .getHistorialtickets(this.fechaini,this.fechafin,this.userdata.uid,this.userdata.idRol)
  .subscribe({
    next: (data) => {
      this.arr_tickets = data;
      let arr_temp:TicketDBH[] = []; 
      let temp1:TicketDBH[] = this.arr_tickets.filter(x => x.prioridadsuc == 'PÁNICO');
      let temp2:TicketDBH[] = this.arr_tickets.filter(x => x.prioridadsuc == 'ALTA');
      let temp3:TicketDBH[] = this.arr_tickets.filter(x => x.prioridadsuc == 'MEDIA');
      let temp4:TicketDBH[] = this.arr_tickets.filter(x => x.prioridadsuc == 'BAJA');
      
      temp1 = temp1.sort(
        (a, b) => b.fecha.getTime() - a.fecha.getTime()
        );

        temp2 = temp2.sort(
          (a, b) => b.fecha.getTime() - a.fecha.getTime()
          );
    
          temp3 = temp3.sort(
            (a, b) => b.fecha.getTime() - a.fecha.getTime()
            );

            temp4 = temp4.sort(
              (a, b) => b.fecha.getTime() - a.fecha.getTime()
              );
      arr_temp = [...temp1,...temp2,...temp3,...temp4]; 
      this.all_arr_tickets = [...arr_temp];
    this.arr_tickets = arr_temp;

        this.cdr.detectChanges(); 
    },
    error: (error) => {
      console.error('Error al escuchar los tickets:', error);
    },
  });
  }

  getdate(tsmp:Timestamp|null):Date
  {
          // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp!.toDate(); // Convierte a Date
      return date; 
  }

  getNameDpto(id:string):string
  {
    
    let name = '';
    let temp = this.catsucursales.filter(x => x.id == id); 
    if(temp.length>0)
      {
        name = temp[0].nombre; 
      } 
    return name; 
  }

  getseverityp(value:string):'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined
  {
    let str:'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined;  
    str = 'danger';
    if(value == "ALTA")
      {
        str = 'danger'
      }

      if(value == "MEDIA")
        {
          str = 'warning'
        }

        if(value == "BAJA")
          {
            str = 'success'
          }
    return str;
  }

  getBgPrioridad(value:string):string
  {
    let str = '';

    if(value == "ALTA")
      {
        str = '#ff0000'
      }

      if(value == "MEDIA")
        {
          str = '#ffe800'
        }

        if(value == "BAJA")
          {
            str = '#61ff00'
          }
    return str; 
  }

  showticket()
  {
    this.modalticket = true; 
  }

  showcomentarios()
  {
    this.modalcomentarios = true; 
  }


  esmiuid(id:string):boolean
  {
    let st = false;
    let userdata = JSON.parse(localStorage.getItem("rwuserdatatk")!);
    let idu = this.userdata.uid; 
    if(id == idu)
      {
        st = true; 
      }
    return st; 
  }



panico(id:string) {
  this.confirmationService.confirm({
      header: 'Confirmación',
      message: 'El estado del ticket se cambiará a Pánico ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass:"btn bg-p-b p-3",
      rejectButtonStyleClass:"btn btn-light me-3 p-3",
      accept: () => {
         this.updatestatusSuc(id); 

         let dataNot:Notificacion= 
         {
            titulo: 'ALERTA DE PÁNICO',
            mensaje:'EL TICKET CON EL ID: '+id+' HA CAMBIADO AL ESTATUS DE PÁNICO',
            uid: 'jBWVcuCQlRh3EKgSkWCz6JMYA9C2',
            fecha: new Date(),
            abierta: false,
            idtk: id,
            notificado:false
         } 

         let idn = this.apiserv.addNotifiacion(dataNot); 

      },
      reject: () => {
          
      }
  });
}

updatestatusSuc(idt:string)
{
  let temp = this.arr_tickets.filter(x => x.id == idt); 
  if(temp.length > 0)
    {
      let ticket = temp[0]; 
      ticket.statusSuc = 'PÁNICO'; 
      ticket.prioridadsuc = 'PÁNICO';

      this.apiserv
      .updateTicket(ticket)
      .then(() => { this.showMessage('success',"Success","Enviado correctamente"); })
      .catch((error) => console.error('Error al actualizar los comentarios:', error));
    }
}

getNameProveedor(idp:string):string
{
  let str = '';  
  let temp = this.catproveedores.filter(x => x.id == idp);
  if(temp.length>0)
    {
      str = temp[0].nombre; 
    }
  return str; 
}


getNameStatus(idst:string):string
{
  let str = '';  
  let temp = this.catStatusT.filter(x => x.id == idst);
  if(temp.length>0)
    {
      str = temp[0].nombre; 
    }
  return str; 
}

async getNameCategoria(idp:string, idc:number):Promise<string>
{
  let str = '';  
  try {
    let documentData = await this.apiserv.getCategoria(idp,idc.toString());
    str= documentData.nombre; 
  } catch (error) {
    console.error('Error obteniendo el documento:', error);
  }
  return str; 
}

getusuarioshelp()
{
  this.apiserv.getusers().subscribe({
    next: data => {
       this.catusuarioshelp =data;
     this.cdr.detectChanges();
    },
    error: error => {
       console.log(error);
       this.showMessage('error',"Error","Error al procesar la solicitud");
    }
});

}


getResponsabletk():string
{
  let idr =  '';
  for(let item of this.catusuarioshelp)
    {
      const existeSucursal = item.sucursales.some(sucursal => sucursal.id == sucursal.id);
      if(existeSucursal)
        {
          idr = item.uid; 
        }
    }

    return idr; 
}


showModalFiltros()
{
  this.modalfiltros = true; 
}

filtrarT()
{
  this.arr_tickets = [...this.all_arr_tickets]; 
  if(this.filterPrioridad != undefined)
    {
      this.arr_tickets = this.arr_tickets.filter(x => x.prioridadsuc == this.filterPrioridad.name);
    }

    if(this.filterarea != undefined)
      {
        this.arr_tickets = this.arr_tickets.filter(x => x.idprov == this.filterarea.id);
      }

      if(this.filtercategoria != undefined)
        {
          this.arr_tickets = this.arr_tickets.filter(x => x.idcategoria == this.filtercategoria.id);
        }
        if(this.filterstatus != undefined)
          {
            this.arr_tickets = this.arr_tickets.filter(x => x.status == this.filterstatus.id);
          }
    this.modalfiltros = false; 
}

limpiarfiltro()
{
  this.arr_tickets = [...this.all_arr_tickets]; 
  this.filterPrioridad = undefined;
  this.filterarea = undefined; 
  this.filtercategoria = undefined; 
  this.filterstatus = undefined;
  this.modalfiltros = false; 
}

getComentariostk(jsond:string):any[]
{
  return JSON.parse(jsond);
}

}
