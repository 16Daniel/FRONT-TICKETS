import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { AceiteService } from '../../../../../services/aceite.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BranchesService } from '../../../../../services/branches.service';
import { Usuario } from '../../../../../models/usuario.model';
import { EntregaAceite } from '../../../../../models/aceite.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Sucursal } from '../../../../../models/sucursal.model';
import { Timestamp } from '@angular/fire/firestore';
import { MultiSelectModule } from 'primeng/multiselect';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-registros-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TabViewModule, ToastModule, ConfirmDialogModule,MultiSelectModule],
  providers:[MessageService,ConfirmationService],
  templateUrl: './registros-pendientes.html',
  styleUrl: './registros-pendientes.scss',
})
export class RegistrosPendientes implements OnInit {
usuario: Usuario;
public entregas:EntregaAceite[] = []; 
public entregasTodo:EntregaAceite[] = []; 
public entregasTA:EntregaAceite[] = []; 
public entregasTodoTA:EntregaAceite[] = []; 
@Input() sucursales: Sucursal[] = [];
sucursalesSel: Sucursal[] = [];
loading:boolean = false; 
constructor(public aceiteService:AceiteService,private confirmationService: ConfirmationService,public cdr:ChangeDetectorRef,private branchesService: BranchesService,private messageService: MessageService)
{
  this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
}

  ngOnInit(): void 
  {
    this.sucursales = this.sucursales.filter(x=> x.idFront); 
    this.sucursalesSel = [...this.sucursales]; 
    this.consultarEntregas(); 
    this.consultarEntregasTA(); 
  setInterval(() => {
    this.consultarEntregas(); 
    this.consultarEntregasTA(); 
  }, 60000); 

  }

    consultarEntregas()
  { 
    this.loading = true;
    this.aceiteService.getEntregasAdmin().subscribe({
      next: (data) => {
        this.entregas= data;
        this.loading = false; 
        this.entregasTodo = [...data]; 
        this.filtrar(); 
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
    this.aceiteService.getEntregasAdminTA().subscribe({
      next: (data) => {
        this.entregasTA= data;
        this.loading = false; 
        this.entregasTodoTA = [...data]; 
        this.filtrar(); 
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false; 
        console.log(error);
      },
    });
  }


   obtenerNombreSucursal(idSucursal:number): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.idFront == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
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

filtrar()
{
  this.entregas = []; 
  this.entregasTA = []; 
  for(let item of this.sucursalesSel)
    {
      let data = this.entregasTodo.filter(x=> x.idSucursal == item.idFront!);
      let dataTA = this.entregasTodoTA.filter(x=> x.idSucursal == item.idFront!);
      this.entregas.push(...data);  
      this.entregasTA.push(...dataTA);  
    }
}

confirmarEliminacion(id:number)
{
   Swal.fire({
        title: "ESTÁS SEGURO?",
        text: "ESTÁS SEGURO QUE DESEAS ELIMINAR?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar!",
        customClass: {
          container: 'swal-topmost'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.eliminar(id);
        }
      });
}

eliminar(id:number)
{
  this.loading = true; 
  this.aceiteService.eliminarEntrega(id).subscribe({
      next: (data) => {
        this.loading = false; 
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Eliminado correctamente",
          showConfirmButton: false,
          timer: 1500
        });
        this.consultarEntregas(); 
      },
      error: (error) => {
        this.loading = false; 
        console.log(error);
      },
    });
}

confirmarEliminacionTA(id:number)
{
   Swal.fire({
        title: "ESTÁS SEGURO?",
        text: "ESTÁS SEGURO QUE DESEAS ELIMINAR?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar!",
        customClass: {
          container: 'swal-topmost'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.eliminarTA(id);
        }
      });
}

eliminarTA(id:number)
{
  this.loading = true; 
  this.aceiteService.eliminarEntregaTA(id).subscribe({
      next: (data) => {
        this.loading = false; 
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Eliminado correctamente",
          showConfirmButton: false,
          timer: 1500
        });
        this.consultarEntregasTA(); 
      },
      error: (error) => {
        this.loading = false; 
        console.log(error);
      },
    });
}
}
