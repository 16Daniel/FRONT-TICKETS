import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ComensalesService } from '../../services/comensales.service';
import { ConteoComensales, itemConteo, sucursalesComensales } from '../../interfaces/ConteoComensales';
import Swal from 'sweetalert2';
import { SucursalesDialog } from "../../dialogs/sucursales-dialog/sucursales-dialog";
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { AgregarConteoDialog } from "../../dialogs/agregar-conteo-dialog/agregar-conteo-dialog";
import { Timestamp } from '@angular/fire/firestore';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { GraficaComensalesComponent } from "../../components/grafica-comensales.component/grafica-comensales.component";
import { DropdownModule } from 'primeng/dropdown';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';

@Component({
  selector: 'app-comensales-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, DialogModule, SucursalesDialog, CalendarModule, MultiSelectModule, AgregarConteoDialog, GraficaComensalesComponent, DropdownModule],
  templateUrl: './comensales-page.html',
  styleUrl: './comensales-page.scss',
})
export class ComensalesPage implements OnInit {
verModalSucursales:boolean = false; 
verModalAgregarConteo:boolean = false; 
public fechaini:Date = new Date(); 
public fechafin:Date = new Date(); 
public sucursalesrw:sucursalesComensales[] = [];
public sucursalescompetencia:sucursalesComensales[] = [];  
public sucursalSel:sucursalesComensales|undefined; 

public dataConteos:itemConteo[] = []; 
public arr_ortiginal:ConteoComensales[]  = []; 
public itemConteo:ConteoComensales|undefined; 

public loading:boolean = false; 
public usuario: Usuario;

constructor(public comensalesService:ComensalesService, private branchesService: BranchesService,public cdr: ChangeDetectorRef)
{
   this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
}

  ngOnInit(): void { this.obtenerSucursales(); this.obtenerSucursalesCompetencia();}

  abrirModalSucursales()
  {
    this.verModalSucursales = true; 
  }

    abrirModalAgregarConteo()
  {  
    this.itemConteo = undefined;
    this.verModalAgregarConteo = true; 
  }

  abrirmodalEditar(id:string)
  {
    let item = this.arr_ortiginal.filter(x=>x.id == id)[0]; 
     this.itemConteo = item;
    this.verModalAgregarConteo = true; 
  }

filtrar()
{ 
  this.dataConteos = []; 
  this.loading = true; 
  this.comensalesService.obtenerconteosEntrefechas(this.fechaini,this.fechafin,this.sucursalSel!.id!).subscribe({
      next: (data) => {
           this.arr_ortiginal = data; 
        this.dataConteos = []; 
         for(let item of data)
          {
            let data:itemConteo = 
                {
                  id:item.sucursal.id!, 
                  fecha:item.fecha,
                  sucursal:item.sucursal,
                  nombreSuc:this.nombreDeSucursal(item.sucursal),
                  mesas:item.mesas,
                  comensales:item.comensales,
                  idReg:item.id!
                }
              this.dataConteos.push(data);
            for(let itemC of item.competencia)
              { 
                let sucursal:sucursalesComensales = {id:itemC.id, nombre:itemC.nombre}; 
                let data:itemConteo = 
                {
                  id:undefined, 
                  fecha:item.fecha,
                  sucursal:sucursal,
                  nombreSuc:this.nombreDeSucursalCompetencia(sucursal),
                  mesas:itemC.mesas,
                  comensales:itemC.comensales,
                  idReg:item.id!
                }

                this.dataConteos.push(data);
              }
          }
         this.loading = false;  
         this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.log(error);
      },
    });
}


getDate(item:Timestamp):Date
{
  return item.toDate(); 
}

nombreDeSucursal(item:sucursalesComensales):string
{
  let temp = this.sucursalesrw.filter(x=> x.id == item.id);
  if(temp.length>0)
    {
      return temp[0].nombre; 
    }else
      {
        return item.nombre;
      } 
}  

nombreDeSucursalCompetencia(item:sucursalesComensales):string
{
  
  let temp = this.sucursalescompetencia.filter(x=> x.id == item.id);
  if(temp.length>0)
    {
      return temp[0].nombre; 
    }else
      {
        return item.nombre;
      } 
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

            let suc = this.usuario.sucursales[0];
            if(suc != undefined)
              { 
                let temp = this.sucursalesrw.filter(x=>x.id! == suc.id!); 
                if(temp.length>0){ this.sucursalSel = temp[0];  }
              }

        this.cdr.detectChanges();
      },
      error: (error) => {

      },
    });
  } 
  
 obtenerSucursalesCompetencia()
  { 
    this.sucursalescompetencia = []; 
    this.comensalesService.obtenerSucursales().subscribe({
      next: (data) => {
         for(let item of data)
          {
            this.sucursalescompetencia.push({id:item.id!,nombre:item.nombre}); 
          }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }


}
