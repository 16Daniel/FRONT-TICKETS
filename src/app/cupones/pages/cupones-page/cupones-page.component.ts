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
import { AidaConfig } from '../../interfaces/aida-config.interface';
import { LoteReferenciaDialogComponent } from '../../dialogs/lote-referencia-dialog/lote-referencia-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cupones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, TableModule, InputTextModule, LoteReferenciaDialogComponent],
  templateUrl: './cupones-page.component.html',
  styleUrls: ['./cupones-page.component.css']
})
export default class CuponesPageComponent implements OnInit {

  private cuponesService = inject(CuponesService);
  private cdr = inject(ChangeDetectorRef);

  lotesHistorial: LoteInfo[] = [];
  lotesDropdown: any[] = [];

  loteSeleccionado: string = '';
  cantidad: number | null = null;

  isGenerating: boolean = false;
  resultado: BatchResponse | null = null;

  mostrarModalReferencia: boolean = false;
  loteAEditar: LoteInfo | null = null;

  aidaConfig: AidaConfig | null = null;

  abrirModalReferencia(lote: LoteInfo) {
    this.loteAEditar = lote;
    this.mostrarModalReferencia = true;
  }

  cerrarModalReferencia(event: boolean) {
    this.mostrarModalReferencia = false;
    this.loteAEditar = null;
    if (event) {
      this.cargarHistorial(); // Recargar tras actualizar
    }
  }

  ngOnInit() {
    this.cargarHistorial();
    this.cargarAidaConfig();
  }

  cargarAidaConfig() {
    this.cuponesService.getAidaConfig().subscribe({
      next: (data) => {
        this.aidaConfig = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener configuración Aida', err);
      }
    });
  }

  accionAida() {
    // Actualmente no hace nada
  }

  cargarHistorial() {
    this.cuponesService.getLotesInfo().subscribe({
      next: (data) => {
        this.lotesHistorial = data;
        this.lotesDropdown = data.map(l => ({ label: l.lote, value: l.lote }));
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
