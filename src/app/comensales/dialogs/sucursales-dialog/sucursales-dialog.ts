import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { sucursalesComensales } from '../../interfaces/ConteoComensales';
import { ComensalesService } from '../../services/comensales.service';
import Swal from 'sweetalert2';
import { TableModule } from 'primeng/table';
import { BranchesService } from '../../../sucursales/services/branches.service';
@Component({
  selector: 'app-sucursales-dialog',
  standalone: true,
  imports: [CommonModule,FormsModule,DialogModule,TableModule,],
  templateUrl: './sucursales-dialog.html',
  styleUrl: './sucursales-dialog.scss',
})
export class SucursalesDialog implements OnInit {
@Input() verModalSucursales:boolean = false; 
@Output() closeEvent = new EventEmitter<boolean>();
formnombreSucursal:string = ''; 
public sucursalesComensalesdata:sucursalesComensales[] = []; 

constructor(public comensalesService:ComensalesService)
{

}

ngOnInit(): void { this.obtenerSucursales(); }

 async agregarSucursal()
  {
    let data:sucursalesComensales = { nombre: this.formnombreSucursal.toUpperCase()}; 
    await this.comensalesService.agregarSucursal(data); 
    this.formnombreSucursal = ""; 
    Swal.fire({
              title: "Success",
              text: "Agregado correctamente",
              icon: "success",
              customClass: {
                container: 'swal-topmost'
              }
            });
  }

  obtenerSucursales()
  {
    this.comensalesService.obtenerSucursales().subscribe({
      next: (data) => {
        this.sucursalesComensalesdata = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  
  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
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
         this.eliminarSucursal(id);
      } else if (result.isDenied) {
         
      }
    });
  }

  async eliminarSucursal(id:string)
  {
    await this.comensalesService.borrarSucursal(id); 
     Swal.fire({
              title: "Success",
              text: "Eliminado correctamente",
              icon: "success",
              customClass: {
                container: 'swal-topmost'
              }
            });
  }

  async actualizarNombre(item:sucursalesComensales)
  {  
    item.nombre = item.nombre.toUpperCase();  
    await this.comensalesService.actualizarSucursal(item,item.id!); 
    Swal.fire({
              title: "Success",
              text: "Actualizado correctamente",
              icon: "success",
              customClass: {
                container: 'swal-topmost'
              }
            });
  }
}
