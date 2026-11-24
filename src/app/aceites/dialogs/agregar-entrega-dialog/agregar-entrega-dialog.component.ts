import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { Subscription } from 'rxjs';

import { AceiteService } from '../../services/aceite.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { BranchesService } from '../../../sucursales/services/branches.service';

@Component({
  selector: 'app-agregar-entrega-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, DialogModule, CalendarModule, DropdownModule],
  providers: [MessageService],
  templateUrl: './agregar-entrega-dialog.component.html',
  styleUrl: './agregar-entrega-dialog.component.scss',
})
export class AgregarEntregaDialogComponent implements OnInit, OnDestroy {
  @Input() mostrarModalAgregar: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  public formFecha: Date = new Date();
  public sucursales: Sucursal[] = [];
  sucursal: Sucursal | undefined;
  public formCantidad: number = 0;

  private branchesSub?: Subscription;

  constructor(
    private messageService: MessageService,
    private branchesService: BranchesService,
    private cdr: ChangeDetectorRef,
    public aceiteService: AceiteService
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
  }

  ngOnDestroy(): void {
    this.branchesSub?.unsubscribe();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onHide() {
    this.closeEvent.emit();
  }

  obtenerSucursales() {
    this.branchesSub?.unsubscribe();
    this.branchesSub = this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }
}
