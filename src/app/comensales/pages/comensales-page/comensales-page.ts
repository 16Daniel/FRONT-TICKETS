import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ComensalesService } from '../../services/comensales.service';
import { ConteoComensales, sucursalesComensales } from '../../interfaces/ConteoComensales';
import Swal from 'sweetalert2';
import { SucursalesDialog } from "../../dialogs/sucursales-dialog/sucursales-dialog";
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { AgregarConteoDialog } from "../../dialogs/agregar-conteo-dialog/agregar-conteo-dialog";
import { Timestamp } from '@angular/fire/firestore';
import { BranchesService } from '../../../sucursales/services/branches.service';

@Component({
  selector: 'app-comensales-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, SucursalesDialog, CalendarModule, MultiSelectModule, AgregarConteoDialog],
  templateUrl: './comensales-page.html',
  styleUrl: './comensales-page.scss',
})
export class ComensalesPage implements OnInit {
verModalSucursales:boolean = false; 
verModalAgregarConteo:boolean = false; 
public fechaini:Date = new Date(); 
public fechafin:Date = new Date(); 
public sucursalesrw:sucursalesComensales[] = [];
public sucursalesSel:sucursalesComensales[] = []; 

public dataConteos:ConteoComensales[] = []; 
public itemConteo:ConteoComensales|undefined; 

public loading:boolean = false; 

constructor(public comensalesService:ComensalesService, private branchesService: BranchesService,public cdr: ChangeDetectorRef)
{

}

  ngOnInit(): void { this.obtenerRegistros(); this.obtenerSucursales();}

  abrirModalSucursales()
  {
    this.verModalSucursales = true; 
  }

    abrirModalAgregarConteo()
  {  
    this.itemConteo = undefined;
    this.verModalAgregarConteo = true; 
  }

  abrirmodalEditar(item:ConteoComensales)
  {
     this.itemConteo = item;
    this.verModalAgregarConteo = true; 
  }

obtenerRegistros()
{ 
  this.loading = true; 
  this.comensalesService.obtenerconteos().subscribe({
      next: (data) => {
         this.dataConteos = data;
         this.loading = false;  
      },
      error: (error) => {
        console.log(error);
      },
    });
}

getDtae(item:Timestamp):Date
{
  return item.toDate(); 
}

nombreDeSucursal(item:sucursalesComensales):string
{
  return item.nombre; 
}

 confirmacionEliminar(id:string)
  {
    Swal.fire({
      title: "está segur@ que desea eliminar?",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      denyButtonText: `Cancelar`,
       customClass: {
                container: 'swal-topmost'
              }
    }).then((result) => {
      if (result.isConfirmed) {
         this.elimarConteo(id)
      } else if (result.isDenied) {
         
      }
    });
  }

async elimarConteo(id:string)
{
     await this.comensalesService.borrarConteo(id); 
         Swal.fire({
                  title: "Success",
                  text: "Eliminado correctamente",
                  icon: "success",
                  customClass: {
                    container: 'swal-topmost'
                  }
                });
} 

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
       
        this.sucursalesrw = []; 
        for(let item of data)
          {
            this.sucursalesrw.push({id:item.id!,nombre:item.nombre}); 
          }  
        this.cdr.detectChanges();
      },
      error: (error) => {

      },
    });
  }



}
