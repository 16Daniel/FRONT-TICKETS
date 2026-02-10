import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConteoComensales, sucursalCompetencia, sucursalesComensales } from '../../interfaces/ConteoComensales';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ComensalesService } from '../../services/comensales.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-agregar-conteo-dialog',
  standalone: true,
  imports: [CommonModule,FormsModule,DialogModule,TableModule, CalendarModule,MultiSelectModule, DropdownModule,InputSwitchModule],
  templateUrl: './agregar-conteo-dialog.html',
  styleUrl: './agregar-conteo-dialog.scss',
})
export class AgregarConteoDialog implements OnInit {
@Input() verModalAgregarConteo:boolean = false; 
@Output() closeEvent = new EventEmitter<boolean>();
@Input() itemConteo:ConteoComensales|undefined; 

public sucursalesrw:sucursalesComensales[] = []; 
public sucursalescompetencia:sucursalesComensales[] = [];  
public versucursalescompetencia:boolean = false;  
public arr_competencia:sucursalCompetencia[] = []; 

public formMesasRW:number|undefined;
public formComensalesRW:number|undefined; 
public formMesasCompetencia:number|undefined; 
public formComensalesCompetencia:number|undefined;  
public sucursaleSelRW:sucursalesComensales|undefined;
public sucursaleSelCompetencia:sucursalesComensales|undefined;

usuario: Usuario;

constructor(public comensalesService:ComensalesService,public cdr: ChangeDetectorRef,
    private branchesService: BranchesService,)
{
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); 
}

ngOnInit(): void 
{ 
  this.obtenerSucursales(); 
  this.obtenerSucursalesCompetencia();

   if(this.itemConteo != undefined)
      {
        this.formComensalesRW = this.itemConteo.comensales;
        this.formMesasRW = this.itemConteo.mesas; 
        this.arr_competencia = this.itemConteo.competencia; 
        this.sucursaleSelRW = this.itemConteo.sucursal; 
      }
      this.cdr.detectChanges(); 
}
onHide() {
    this.closeEvent.emit(false); // Cerrar modal
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
         if(temp.length>0){ this.sucursaleSelRW = temp[0];  }
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


agregarCompetencia()
{  
  let temp = this.arr_competencia.filter(x=> x.id == this.sucursaleSelCompetencia!.id!); 
  if(temp.length== 0)
    {
        let data:sucursalCompetencia = 
        {
          id:this.sucursaleSelCompetencia!.id!,
          nombre:this.sucursaleSelCompetencia!.nombre,
          mesas:this.formMesasCompetencia!,
          comensales:this.formComensalesCompetencia!
        }
        this.arr_competencia.push(data); 

        this.sucursaleSelCompetencia = undefined;
        this.formMesasCompetencia = undefined;
        this.formComensalesCompetencia = undefined; 
    }

}

eliminarCompetencia(index:number)
{
  this.arr_competencia.splice(index, 1);
  this.cdr.detectChanges(); 
}

async agregarConteo()
{
  let data:ConteoComensales =
  {
     fecha: Timestamp.fromDate(new Date()),
     sucursal:this.sucursaleSelRW!,
     idSucursal: this.sucursaleSelRW!.id!, 
     competencia:this.arr_competencia, 
     mesas:this.formMesasRW!,
     comensales:this.formComensalesRW!
  }

  await this.comensalesService.agregarconteo(data); 

   Swal.fire({
                title: "Success",
                text: "Agregado correctamente",
                icon: "success",
                customClass: {
                  container: 'swal-topmost'
                }
              });
              this.onHide();
}

getDtae(item:Timestamp):Date
{
  return item.toDate(); 
}

  async actualizarConteo()
  {
    this.itemConteo!.mesas = this.formMesasRW!;
    this.itemConteo!.comensales = this.formComensalesRW!; 
    this.itemConteo!.competencia = this.arr_competencia; 
    this.itemConteo!.sucursal = this.sucursaleSelRW!;

    await this.comensalesService.actualizarConteo(this.itemConteo,this.itemConteo!.id!); 
    Swal.fire({
              title: "Success",
              text: "Actualizado correctamente",
              icon: "success",
              customClass: {
                container: 'swal-topmost'
              }
            });
            this.onHide(); 
  }

}
