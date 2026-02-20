import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { PreciosaycService } from '../../services/preciosayc.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { colorPrecioayc } from '../../interfaces/sucursalRegion';
@Component({
  selector: 'app-modal-precios-ayc',
  standalone: true,
  imports: [CommonModule,DialogModule,FormsModule],
  templateUrl: './modal-precios-ayc.html',
  styleUrl: './modal-precios-ayc.scss',
})
export class ModalPreciosAyc implements OnInit {
@Input() visible:boolean = false; 
@Output() closeEvent = new EventEmitter<boolean>();
@Output() actualizarData = new EventEmitter<void>(); 
public dataColores:colorPrecioayc[] = []; 
public formcolor:string = '';
public formprecio:number = 0; 
public idItem:number|undefined; 

constructor(public preciosaycService:PreciosaycService, public cdr: ChangeDetectorRef){}
  ngOnInit(): void { this.obtenerColores(); }
onHide = () => this.closeEvent.emit(false);

obtenerColores()
{
   this.preciosaycService.getColoresPreciosAYC().subscribe({
        next: (data) => {
          this.dataColores = data; 
          this.cdr.detectChanges();
        },
        error: (error) => {
            console.log(error);
            Swal.fire("Oops...", "Error al procesar la solicitud", "error");
        },
      });
}

agregar()
{
   this.preciosaycService.agregarcolorPrecioAYC(this.formcolor,this.formprecio).subscribe({
        next: (data) => {
            Swal.fire({
                            position: "top-end",
                            icon: "success",
                            title: "Agregado correctamente",
                            showConfirmButton: false,
                            timer: 1500,
                            customClass: {
         container: 'swal-topmost'
       }
                          });
          this.formcolor = "#000000"; 
          this.formprecio = 0; 
          this.obtenerColores(); 
          this.actualizarData.emit(); 
          this.cdr.detectChanges();
        },
        error: (error) => {
            console.log(error);
            Swal.fire("Oops...", "Error al procesar la solicitud", "error");
        },
      });
}

confirmarEliminar(id:number)
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

  this.preciosaycService.eliminarColorePrecioAYC(id).subscribe({
        next: (data) => {
            Swal.fire({
                            position: "top-end",
                            icon: "success",
                            title: "Eliminado correctamente",
                            showConfirmButton: false,
                            timer: 1500,
                            customClass: {
         container: 'swal-topmost'
       }
                          });
          this.formcolor = "#000000"; 
          this.formprecio = 0; 
          this.obtenerColores(); 
          this.cdr.detectChanges();
        },
        error: (error) => {
            console.log(error);
            Swal.fire("Oops...", "Error al procesar la solicitud", "error");
        },
      });
}

editar(item:colorPrecioayc)
{
  this.idItem = item.id!;
  this.formcolor = item.color; 
  this.formprecio = item.precio; 
}

cancelarEditar()
{
  this.formcolor='#000000'; 
  this.formprecio = 0; 
  this.idItem = undefined; 
}

actualizar()
{

  this.preciosaycService.actualizarcolorPrecioAYC(this.idItem!,this.formcolor,this.formprecio).subscribe({
        next: (data) => {
            Swal.fire({
                            position: "top-end",
                            icon: "success",
                            title: "Actualizado correctamente",
                            showConfirmButton: false,
                            timer: 1500,
                            customClass: {
         container: 'swal-topmost'
       }
                          });
          this.formcolor = "#000000"; 
          this.formprecio = 0; 
          this.idItem = undefined; 
          this.obtenerColores();
          this.actualizarData.emit();  
          this.cdr.detectChanges();
        },
        error: (error) => {
            console.log(error);
            Swal.fire("Oops...", "Error al procesar la solicitud", "error");
        },
      });

}

}
