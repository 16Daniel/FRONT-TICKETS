import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { InventarioService } from '../../../services/inventario.service';
import { Inventario } from '../../../models/inventario.model';
import { Usuario } from '../../../models/usuario.model';
import Swal from 'sweetalert2';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-captura-inventario-diario',
  standalone: true,
  imports: [CommonModule,TableModule],
  templateUrl: './captura-inventario-diario.component.html',
  styleUrl: './captura-inventario-diario.component.scss',
})
export default class CapturaInventarioDiarioComponent implements OnInit {
public catArticulos:Inventario[] = []; 
public usuario:Usuario;
  constructor(private invServ:InventarioService,
    private cdr: ChangeDetectorRef)
  {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {  this.obtenerArticulos(); }

  obtenerArticulos()
  {
    Swal.showLoading(); 
    let idSucursal:number = 1; 
    this.invServ.obtenerArticulos(idSucursal).subscribe({
      next: (data) => {
        this.catArticulos = data;
        Swal.close();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        Swal.close();
      },
    });
  }
}
