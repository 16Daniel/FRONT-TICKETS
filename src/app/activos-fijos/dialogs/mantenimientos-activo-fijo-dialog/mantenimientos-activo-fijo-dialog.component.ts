import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { Ticket } from '../../../tickets/models/ticket.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { ActivosFijosService } from '../../services/activos-fijos.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { SeleccionarTicketActivoFijoDialogComponent } from '../seleccionar-ticket-activo-fijo-dialog/seleccionar-ticket-activo-fijo-dialog.component';
import { ActivoFijo } from '../../models/activo-fijo.model';
import { MantenimientoActivoFijo } from '../../../mantenimientos/interfaces/mantenimiento-activo-fijo.interface';

@Component({
  selector: 'app-mantenimientos-activo-fijo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    TableModule,
    SeleccionarTicketActivoFijoDialogComponent,
    TooltipModule,
  ],
  templateUrl: './mantenimientos-activo-fijo-dialog.component.html',
  styleUrl: './mantenimientos-activo-fijo-dialog.component.scss',
})
export class MantenimientosActivoFijoDialogComponent implements OnDestroy {
  @Input() mostrarModal: boolean = false;
  @Input() activoFijo: ActivoFijo | any;
  @Output() closeEvent = new EventEmitter<boolean>();

  mantenimientos: MantenimientoActivoFijo[] = [];
  mantenimiento: MantenimientoActivoFijo = new MantenimientoActivoFijo();

  ticket: Ticket | undefined;
  mostrarModalTickets: boolean = false;
  guardando: boolean = false;
  usuario: Usuario;

  private ticketSub?: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private fixedAssetsService: ActivosFijosService,
    public datesHelper: DatesHelperService,
    private ticketsService: TicketsService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnDestroy(): void {
    this.ticketSub?.unsubscribe();
  }

  get listaMantenimientos(): MantenimientoActivoFijo[] {
    return this.activoFijo?.mantenimientos || [];
  }

  get costoTotalMantenimientos(): number {
    return this.listaMantenimientos
      .filter((m) => !m.eliminado)
      .reduce((total, m) => total + (Number(m.costo) || 0), 0);
  }

  get superaCostoActivo(): boolean {
    const total = this.costoTotalMantenimientos;
    const costoActivo = Number(this.activoFijo?.costo) || 0;
    return total > 0 && costoActivo > 0 && total >= costoActivo;
  }

  onHide(): void {
    this.closeEvent.emit(false);
  }

  async crear(form: NgForm): Promise<void> {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    if (this.guardando) return;
    this.guardando = true;
    this.cdr.detectChanges();

    try {
      const result = await this.fixedAssetsService.addMantenimiento(this.activoFijo.id, {
        ...this.mantenimiento,
      });
      if (!Array.isArray(this.activoFijo.mantenimientos)) {
        this.activoFijo.mantenimientos = [];
      }
      this.activoFijo.mantenimientos.push(result);
      this.mantenimiento = new MantenimientoActivoFijo();
      form.resetForm();
      this.showMessage('success', 'Correcto', 'Mantenimiento registrado correctamente');
    } catch (error) {
      console.error('Error al registrar mantenimiento:', error);
      this.showMessage('error', 'Error', 'No se pudo registrar el mantenimiento');
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  confirmaEliminacion(id: string): void {
    Swal.fire({
      title: '¿Eliminar mantenimiento?',
      text: 'Este registro de mantenimiento se eliminará del activo fijo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminar(id);
      }
    });
  }

  async eliminar(id: string): Promise<void> {
    try {
      await this.fixedAssetsService.deleteMantenimiento(this.activoFijo.id, id);
      this.activoFijo.mantenimientos = this.listaMantenimientos.filter(
        (x: MantenimientoActivoFijo) => x.id != id
      );
      this.showMessage('success', 'Correcto', 'Mantenimiento eliminado correctamente');
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al eliminar mantenimiento:', error);
      this.showMessage('error', 'Error', 'No se pudo eliminar el mantenimiento');
    }
  }

  ligarTicket(ticket: Ticket): void {
    this.mantenimiento.folioTicket = ticket.folio;
  }

  buscarTicket(): void {
    if (!this.mantenimiento.folioTicket?.trim()) return;
    this.ticketSub?.unsubscribe();
    this.ticketSub = this.ticketsService
      .getTicketsPorFolio(this.mantenimiento.folioTicket)
      .subscribe((result) => {
        if (result.length == 0) {
          this.showMessage(
            'warn',
            'Error',
            'No se encontró ticket con folio ' + this.mantenimiento.folioTicket
          );
          this.mantenimiento.folioTicket = '';
        }
      });
  }
}
