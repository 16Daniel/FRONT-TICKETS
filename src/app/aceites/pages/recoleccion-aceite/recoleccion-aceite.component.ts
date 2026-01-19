import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { EntregaAceite } from '../../../models/aceite.model';
import { Sucursal } from '../../../models/sucursal.model';
import { AceiteService } from '../../../services/aceite.service';
import { BranchesService } from '../../../services/branches.service';
import { Timestamp } from '@angular/fire/firestore';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-recoleccion-aceite',
  standalone: true,
   imports: [CommonModule, FormsModule, TableModule,TabViewModule,ToastModule,DialogModule,CalendarModule,DropdownModule],
      providers:[MessageService],
  templateUrl: './recoleccion-aceite.component.html',
})
export default class RecoleccionAceiteComponent implements OnInit {
public TodasLasEntregas:EntregaAceite[] = []; 
public TodasLasEntregasTA:EntregaAceite[] = []; 
public entregas:EntregaAceite[] = []; 
public entregasTA:EntregaAceite[] = []; 
public mostrarModalValidacion:boolean = false; 
public sucursales: Sucursal[] = [];
public sucursalSel: Sucursal[] = [];
public formcomentarios:string = ""; 
public itemEntrega:EntregaAceite|undefined; 
public tipoActualizacion:number = 0;  
public loading:boolean = false; 
fechaini:Date = new Date(); 
fechafin:Date = new Date(); 
usuario: Usuario;
esTrampadeAceite:boolean = false; 
constructor(public aceiteService:AceiteService,public cdr:ChangeDetectorRef,private branchesService: BranchesService,private messageService: MessageService)
{
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
}
  ngOnInit(): void 
  {
    this.obtenerSucursales(); 
    
    setInterval(() => {
      this.consultarEntregas(); 
    }, 60000);
    
   }
 
     showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  consultarEntregas()
  {
    this.loading = true; 
    this.aceiteService.getEntregasCedis().subscribe({
      next: (data) => {
        this.entregas = []; 
        this.TodasLasEntregas = data; 
        let sucursalesusuario = this.usuario.sucursales; 
        for(let item of sucursalesusuario)
          {
            let suc = this.sucursales.filter(x => x.id == item.id)[0]; 
            let temp = this.TodasLasEntregas.filter(x => x.idSucursal == suc.idFront); 
            this.entregas = [...this.entregas,...temp];  
          }
           this.loading = false;
           this.consultarEntregasTA(); 
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false; 
        console.log(error);
      },
    });
  }

   consultarEntregasTA()
  {
    this.loading = true; 
    this.aceiteService.getEntregasCedisTA().subscribe({
      next: (data) => {
        this.entregasTA = []; 
        this.TodasLasEntregasTA = data; 
        let sucursalesusuario = this.usuario.sucursales; 
        for(let item of sucursalesusuario)
          {
            let suc = this.sucursales.filter(x => x.id == item.id)[0]; 
            let temp = this.TodasLasEntregasTA.filter(x => x.idSucursal == suc.idFront); 
            this.entregasTA = [...this.entregasTA,...temp];  
          }
           this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false; 
        console.log(error);
      },
    });
  }

  abrirmodalValidacion(item:EntregaAceite,tipo:number,trampadeaceite:boolean)
  {
    this.tipoActualizacion = tipo; 
    this.itemEntrega = item; 
    this.esTrampadeAceite = trampadeaceite; 
    this.mostrarModalValidacion = true; 
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

    obtenerNombreSucursal(idSucursal:number): string {
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
        this.loading = false; 
         this.consultarEntregas(); 
        this.cdr.detectChanges();
      },
      error: (error) => {
         this.loading = false;
      },
    });
  }

    actualizarEntrega()
  {   
    if(this.formcomentarios == "")
      {
        this.showMessage('info','info','Favor de agregar un comentario');
        return; 
      }
    if(this.tipoActualizacion == 1)
      {
                    this.loading = true; 
              this.aceiteService.ValidacionCedis(this.itemEntrega!.id,this.formcomentarios).subscribe({
              next: (data) => {
                this.mostrarModalValidacion = false; 
                this.showMessage('success','Success','Guardado correctamente');
                this.formcomentarios = ""; 
                this.consultarEntregas(); 
                this.cdr.detectChanges();
              },
              error: (error) => {
                
              },
            });
      } else
      {
               this.loading = true; 
              this.aceiteService.RechazoCedis(this.itemEntrega!.id,this.formcomentarios).subscribe({
              next: (data) => {
                this.mostrarModalValidacion = false; 
                this.showMessage('success','Success','Guardado correctamente');
                this.formcomentarios = ""; 
                this.consultarEntregas(); 
                this.cdr.detectChanges();
              },
              error: (error) => {
                
              },
            });
      }
    
  }

    actualizarEntregaTA()
  {   
    if(this.formcomentarios == "")
      {
        this.showMessage('info','info','Favor de agregar un comentario');
        return; 
      }
    if(this.tipoActualizacion == 1)
      {
                    this.loading = true; 
              this.aceiteService.ValidacionCedisTA(this.itemEntrega!.id,this.formcomentarios).subscribe({
              next: (data) => {
                this.mostrarModalValidacion = false; 
                this.showMessage('success','Success','Guardado correctamente');
                this.formcomentarios = ""; 
                this.consultarEntregas(); 
                this.cdr.detectChanges();
              },
              error: (error) => {
                
              },
            });
      } else
      {
               this.loading = true; 
              this.aceiteService.RechazoCedisTA(this.itemEntrega!.id,this.formcomentarios).subscribe({
              next: (data) => {
                this.mostrarModalValidacion = false; 
                this.showMessage('success','Success','Guardado correctamente');
                this.formcomentarios = ""; 
                this.consultarEntregas(); 
                this.cdr.detectChanges();
              },
              error: (error) => {
                
              },
            });
      }
    
  }

}
