import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ModalAgregarPrecioAyc } from "../../dialogs/modal-agregar-precio-ayc/modal-agregar-precio-ayc";
import { PreciosaycService } from '../../services/preciosayc.service';
import { colorPrecioayc, PreciosAyc } from '../../interfaces/sucursalRegion';
import Swal from 'sweetalert2';
import { ModalPreciosAyc } from "../../dialogs/modal-precios-ayc/modal-precios-ayc";
@Component({
  selector: 'app-precios-ayc-page',
  standalone: true,
  imports: [CommonModule, TableModule, ModalAgregarPrecioAyc, ModalPreciosAyc],
  templateUrl: './precios-ayc-page.component.html',
  styleUrl: './precios-ayc-page.component.scss',
})
export default class PreciosAycPageComponent implements OnInit {
modalAgregar:boolean = false;
modalcolores:boolean = false; 

public preciosdata:PreciosAyc[] = []; 
public itemReg:PreciosAyc|undefined; 
public dataColores:colorPrecioayc[] = []; 
constructor(public preciosaycService:PreciosaycService, public cdr: ChangeDetectorRef){}

ngOnInit(): void { this.obtenerColores(); this.obtenerPrecios(); }


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
abrirModalAgregar()
{
  this.itemReg = undefined; 
  this.modalAgregar = true; 
}

abrirModalEditar(item:PreciosAyc)
{
  this.itemReg = item; 
  this.modalAgregar = true; 
}

abrirModalColores()
{
  this.modalcolores = true; 
}

obtenerPrecios()
{
   Swal.fire({
        target: document.body,
        allowOutsideClick: false,
        icon: 'info',
        text: 'Espere por favor...',
        didOpen: () => Swal.showLoading(),
        customClass: {
          container: 'swal-topmost'
        }
      });

   this.preciosaycService.getPreciosAYC().subscribe({
      next: (data) => {
        this.preciosdata = data;
        console.log(data); 
        Swal.close(); 
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

  this.preciosaycService.eliminarPreciosAYC(id).subscribe({
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
          this.obtenerPrecios(); 
          this.cdr.detectChanges();
        },
        error: (error) => {
            console.log(error);
            Swal.fire("Oops...", "Error al procesar la solicitud", "error");
        },
      });
}

obtenerColor(id:number):string
{
  let color = "";
  let temp = this.dataColores.filter(x=> x.id == id);
  if(temp.length>0){ color = temp[0].color;} 
  return color; 
}

obtenerPrecio(id:number):string
{
  let precio = "";
  let temp = this.dataColores.filter(x=> x.id == id);
  if(temp.length>0){ precio = temp[0].precio.toString();} 
  return precio; 
}

   getTextColor(hexColor: string): string {
    // Convertir HEX a RGB
    let r, g, b;
    if (hexColor.startsWith('#')) {
      const hex = hexColor.substring(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else {
        return '#000000'; // fallback
      }
    } else {
      // Si no es HEX, asumimos que ya es RGB o nombre de color; podrías ampliar el parser
      return '#000000';
    }

    // Calcular brillo (fórmula de luminancia)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
    return brightness > 128 ? '#000000' : '#ffffff';
  }

}
