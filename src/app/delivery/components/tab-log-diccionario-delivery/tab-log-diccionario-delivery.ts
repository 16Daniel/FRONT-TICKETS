import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { DiccionariodeliveryService } from '../../services/diccionariodelivery.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { LogDiccionarioDelivery } from '../../interfaces/diccionariodelivery';

@Component({
  selector: 'app-tab-log-diccionario-delivery',
  standalone: true,
  imports: [CommonModule, ToastModule, ConfirmDialogModule,TableModule,
    DialogModule,
    ButtonModule,
    TagModule,
    TooltipModule,],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tab-log-diccionario-delivery.html',
  styleUrl: './tab-log-diccionario-delivery.scss',
})
export class TabLogDiccionarioDelivery implements OnInit {
  logs: LogDiccionarioDelivery[] = [];
  loading: boolean = true;

  // Variables para la vista modal del JSON
  displayJsonDialog: boolean = false;
  selectedJsonFormatted: string = '';
  selectedPedidoId: string = '';

  ngOnInit(): void { this.cargarLogs(); }
     constructor(
        private diccionarioService: DiccionariodeliveryService,
        public cdr: ChangeDetectorRef,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
      ) {
      }

        showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

      cargarLogs(): void {
        this.loading = true; 
    this.diccionarioService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener los logs', err);
        this.loading = false;
      }
    });
  }
   
   updateLog(idl:number): void {
    this.loading = true; 
    this.diccionarioService.updateLog(idl).subscribe({
      next: (data) => {
        this.showMessage('success', 'Success', 'Procesado correctamente');
        this.loading = false;
        this.cargarLogs(); 
      },
      error: (err) => {
        console.error('Error al actualizar el log', err);
        this.loading = false;
      }
    });
  }

  // Método para formatear e inspeccionar el JSON
  verJson(log: LogDiccionarioDelivery): void {
    this.selectedPedidoId = log.idpedido || `ID Log: ${log.id}`;
    
    if (log.jsonpedido) {
      try {
        const parsed = JSON.parse(log.jsonpedido);
        this.selectedJsonFormatted = JSON.stringify(parsed, null, 2);
      } catch (e) {
        // En caso de que no sea un JSON válido
        this.selectedJsonFormatted = log.jsonpedido;
      }
    } else {
      this.selectedJsonFormatted = 'Sin información de JSON';
    }

    this.displayJsonDialog = true;
  }

}
