import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { AgregarPagoComponent } from '../components/agregar-pago/agregar-pago.component';
import { AdminPagosAdicionalesTableComponent } from "../../../shopping-admin/components/admin-pagos-adicionales-table/admin-pagos-adicionales-table.component";
import { PagoAdicional } from '../../../../../models/AdministracionCompra';
import { ShoppingService } from '../../../../../services/shopping.service';

@Component({
  selector: 'app-bonos-tab',
  standalone: true,
   imports: [CommonModule, AgregarPagoComponent, AdminPagosAdicionalesTableComponent],
  templateUrl: './bonos-tab.component.html',
  styleUrl: './bonos-tab.component.scss',
})
export class BonosTabComponent implements OnInit {
public modalAgregar:boolean = false; 
public data:PagoAdicional[] = []; 

constructor( private shopServ:ShoppingService, private cdr: ChangeDetectorRef)
{

}

ngOnInit(): void {  this.obtenerPagosPendientes();}

  abrirModalAgregar()
  {
    this.modalAgregar = true; 
  }

    obtenerPagosPendientes()
  {
     this.shopServ.getPagos(2).subscribe({
      next: (data) => {
        this.data = data; 
        console.log(data);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

}
