import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuponesService } from '../../services/cupones.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { BatchResponse } from '../../interfaces/batch-response.interface';
import { LoteInfo } from '../../interfaces/lote-info.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cupones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, TableModule, InputTextModule],
  templateUrl: './cupones-page.component.html',
  styleUrls: ['./cupones-page.component.css']
})
export default class CuponesPageComponent implements OnInit {

  private cuponesService = inject(CuponesService);
  private cdr = inject(ChangeDetectorRef);

  lotesHistorial: LoteInfo[] = [];

  loteSeleccionado: string = '';
  cantidad: number | null = null;

  isGenerating: boolean = false;
  resultado: BatchResponse | null = null;

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.cuponesService.getLotesInfo().subscribe({
      next: (data) => {
        this.lotesHistorial = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener historial', err);
      }
    });
  }

  generar() {
    if (!this.loteSeleccionado || !this.cantidad || this.cantidad <= 0) return;

    this.isGenerating = true;
    this.cuponesService.generateBatch({ lote: this.loteSeleccionado, cantidad: this.cantidad })
      .subscribe({
        next: (res) => {
          this.resultado = res;
          this.loteSeleccionado = '';
          this.cantidad = null;

          this.isGenerating = false;
          this.cargarHistorial(); // Refrescamos la tabla tras generar
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.isGenerating = false;
          this.cdr.detectChanges();

          Swal.fire({
            icon: 'error',
            title: 'Error al generar',
            text: err.error?.message || 'Ocurrió un error al intentar generar los cupones.',
            confirmButtonColor: '#3085d6'
          });
        }
      });
  }

}
