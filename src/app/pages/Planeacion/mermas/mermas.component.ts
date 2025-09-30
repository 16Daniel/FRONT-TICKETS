import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';
@Component({
  selector: 'app-mermas',
  standalone: true,
  imports: [CommonModule,FormsModule,CalendarModule,MultiSelectModule],
  templateUrl: './mermas.component.html',
  styleUrl: './mermas.component.css',
})
export default class MermasComponent implements OnInit {
public fechaini:Date = new Date(); 
public fechafin:Date = new Date(); 
public sucursales: Sucursal[] = [];
public sucursalesSel: Sucursal[] = [];

constructor(private branchesService:BranchesService,
  private cdr: ChangeDetectorRef,
)
{

}

  ngOnInit(): void { this.obtenerSucursales(); }

   obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        // this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }


}
