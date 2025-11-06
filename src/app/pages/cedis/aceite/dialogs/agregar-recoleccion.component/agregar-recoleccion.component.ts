import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { Sucursal } from '../../../../../models/sucursal.model';
import { DropdownModule } from 'primeng/dropdown';
import { AceiteService } from '../../../../../services/aceite.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-recoleccion',
  standalone: true,
    imports: [CommonModule, DialogModule, FormsModule,CalendarModule,DropdownModule],
  templateUrl: './agregar-recoleccion.component.html',
  styleUrl: './agregar-recoleccion.component.css',
})
export class AgregarRecoleccionComponent implements OnInit {
@Input() visible:boolean = false;
@Output() closeEvent = new EventEmitter<boolean>();
@Input() sucursales: Sucursal[] = [];
public sucursal: Sucursal|undefined;
public fecha:Date = new Date(); 
public loading:boolean = false; 
constructor(public aceiteService:AceiteService)
{

}
ngOnInit(): void { }

   onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }   

  guardar()
  { 
       this.loading = true; 
       this.aceiteService.agregarEntregaManual(this.sucursal!.idFront!,this.fecha).subscribe({
            next: (data) => {
              this.loading = false;
                Swal.fire({
              title: "Success",
              text: "Agregado correctamente",
              icon: "success",
              customClass: {
        container: 'swal-topmost'
      }
                });
            },
            error: (error) => {
              console.log(error);
              this.loading = false;
               Swal.fire("Oops...", "Error al procesar la solicitud", "error");
            },
          });
  }

}
