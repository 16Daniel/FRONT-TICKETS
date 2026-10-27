import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ticket } from '../../interfaces/ticket.model';
import { Bitacora } from '../../../shared/interfaces/bitacora.model';
import { BitacoraService } from '../../../shared/services/bitacora.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { TicketDetailHelperService } from '../../services/ticket-detail-helper.service';

@Component({
  selector: 'app-ticket-banners-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-banners-alert.component.html',
  styleUrl: './ticket-banners-alert.component.scss',
})
export class TicketBannersAlertComponent implements OnInit, OnChanges, OnDestroy {
  @Input() ticket!: Ticket;

  ultimaMitigacion: Bitacora | null = null;
  private mitigacionSub?: Subscription;
  private currentTicketId?: string;

  constructor(
    private bitacoraService: BitacoraService,
    public datesHelper: DatesHelperService,
    private helper: TicketDetailHelperService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.suscribirMitigacion();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket'] && this.ticket?.id !== this.currentTicketId) {
      this.suscribirMitigacion();
    }
  }

  ngOnDestroy(): void {
    this.mitigacionSub?.unsubscribe();
  }

  private suscribirMitigacion(): void {
    this.mitigacionSub?.unsubscribe();
    this.currentTicketId = this.ticket?.id;
    if (!this.currentTicketId) {
      this.ultimaMitigacion = null;
      return;
    }

    this.mitigacionSub = this.bitacoraService
      .getBitacoras('TICKETS', this.currentTicketId, 'MITIGACION')
      .subscribe((data) => {
        this.ultimaMitigacion = data && data.length > 0 ? data[data.length - 1] : null;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
  }

  obtenerNombreComite(idComite: string): string {
    return this.helper.obtenerNombreComite(idComite);
  }
}
