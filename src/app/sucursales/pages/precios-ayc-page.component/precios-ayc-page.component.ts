import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ModalAgregarPrecioAyc } from "../../dialogs/modal-agregar-precio-ayc/modal-agregar-precio-ayc";
import { PreciosaycService } from '../../services/preciosayc.service';
import { PreciosAyc } from '../../interfaces/sucursalRegion';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-precios-ayc-page',
  standalone: true,
  imports: [CommonModule, TableModule, ModalAgregarPrecioAyc],
  templateUrl: './precios-ayc-page.component.html',
  styleUrl: './precios-ayc-page.component.scss',
})
export class PreciosAycPageComponent implements OnInit {
modalAgregar:boolean = false; 
public preciosdata:PreciosAyc[] = []; 
constructor(public preciosaycService:PreciosaycService, public cdr: ChangeDetectorRef){}

ngOnInit(): void { this.obtenerPrecios(); }

abrirModalAgregar()
{
  this.modalAgregar = true; 
}

obtenerPrecios()
{
   this.preciosaycService.getPreciosAYC().subscribe({
      next: (data) => {
        this.preciosdata = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
          console.log(error);
          Swal.fire("Oops...", "Error al procesar la solicitud", "error");
      },
    });
}
}
