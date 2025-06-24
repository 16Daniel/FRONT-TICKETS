import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { AceiteService } from '../../../services/aceite.service';
import { BranchesService } from '../../../services/branches.service';
import { Sucursal } from '../../../models/sucursal.model';
import { EntregaAceite } from '../../../models/aceite.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-branches-oil-tab',
  standalone: true,
   imports: [CommonModule, FormsModule, TableModule],
  templateUrl: './branches-oil-tab.component.html',
  styleUrl: './branches-oil-tab.component.scss',
})
export class BranchesOilTabComponent implements OnInit {
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
    this.aceiteService.getEnttregas().subscribe({
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
