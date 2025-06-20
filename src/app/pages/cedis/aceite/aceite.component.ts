import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { EntregaAceite } from '../../../models/aceite.model';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AceiteService } from '../../../services/aceite.service';
import { ModalAgregarEntregaComponent } from "../../../modals/modal-agregar-entrega/modal-agregar-entrega.component";
import { Timestamp } from '@angular/fire/firestore';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';

@Component({
  selector: 'app-aceite',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ModalAgregarEntregaComponent],
  templateUrl: './aceite.component.html',
  styleUrl: './aceite.component.scss',
})
export default class AceiteComponent implements OnInit {
public entregas:EntregaAceite[] = []; 
public mostrarModalAgregar:boolean = false; 
public sucursales: Sucursal[] = [];
constructor(public aceiteService:AceiteService,public cdr:ChangeDetectorRef,private branchesService: BranchesService,)
{

}
  ngOnInit(): void 
  {
    this.obtenerSucursales(); 
    this.consultarEntregas(); 
   }
 
  consultarEntregas()
  {
    this.aceiteService.getCollection().subscribe({
      next: (data) => {
        this.entregas= data;
        console.log(this.entregas); 
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  abrirmodalAgregar()
  {
    this.mostrarModalAgregar = true; 
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

    obtenerNombreSucursal(idSucursal: string): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.id == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

     obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        
      },
    });
  }
}
