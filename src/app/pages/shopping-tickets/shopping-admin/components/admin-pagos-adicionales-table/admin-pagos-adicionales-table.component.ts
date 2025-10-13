import { CommonModule } from '@angular/common';
import { Component, Input, type OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { PagoAdicional } from '../../../../../models/AdministracionCompra';
import { Timestamp } from '@angular/fire/firestore'
@Component({
  selector: 'app-admin-pagos-adicionales-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './admin-pagos-adicionales-table.component.html',
  styleUrl: './admin-pagos-adicionales-table.component.scss',
})
export class AdminPagosAdicionalesTableComponent implements OnInit {
 @Input() data:PagoAdicional[] = [];  
 @Input() tipoPago:number = 1; 
  ngOnInit(): void { }

  obtenerFecha(value:Timestamp):Date
  {
    return value.toDate(); 
  }

}
