import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';

import { AceiteService } from '../../services/aceite.service';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../sucursales/services/branches.service';

@Component({
  selector: 'app-modal-agregar-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, DialogModule, CalendarModule, DropdownModule],
  providers: [MessageService],
  templateUrl: './modal-agregar-entrega.component.html',
})
export class ModalAgregarEntregaComponent implements OnInit {
  @Input() mostrarModalAgregar: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  public formFecha: Date = new Date();
  public sucursales: Sucursal[] = [];
  sucursal: Sucursal | undefined;
  public formCantidad: number = 0;

  constructor(
    private messageService: MessageService,
    private branchesService: BranchesService,
    private cdr: ChangeDetectorRef,
    public aceiteService: AceiteService) { }

  ngOnInit(): void { this.obtenerSucursales(); }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

}
