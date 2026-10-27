import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AvatarModule } from 'ngx-avatars';
import { Subscription } from 'rxjs';
import { Ticket } from '../../interfaces/ticket.model';
import { Bitacora } from '../../../shared/interfaces/bitacora.model';
import { BitacoraService } from '../../../shared/services/bitacora.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';

@Component({
  selector: 'app-ticket-tab-historial',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  templateUrl: './ticket-tab-historial.component.html',
  styleUrl: './ticket-tab-historial.component.scss',
})
export class TicketTabHistorialComponent implements OnInit, OnChanges, OnDestroy {
  @Input() ticket!: Ticket;

  historial: Bitacora[] = [];
  private historialSub?: Subscription;
  private currentTicketId?: string;

  constructor(
    private bitacoraService: BitacoraService,
    public datesHelper: DatesHelperService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.suscribirHistorial();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket'] && this.ticket?.id !== this.currentTicketId) {
      this.suscribirHistorial();
    }
  }

  ngOnDestroy(): void {
    this.historialSub?.unsubscribe();
  }

  private suscribirHistorial(): void {
    this.historialSub?.unsubscribe();
    this.currentTicketId = this.ticket?.id;
    if (!this.currentTicketId) {
      this.historial = [];
      return;
    }

    this.historialSub = this.bitacoraService
      .getBitacoras('TICKETS', this.currentTicketId, 'SISTEMA')
      .subscribe((data) => {
        this.historial = data ? data.slice().reverse() : [];
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
  }
}
