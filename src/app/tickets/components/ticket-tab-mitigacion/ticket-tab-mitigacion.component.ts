import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { AvatarModule } from 'ngx-avatars';
import { Subscription } from 'rxjs';
import { Ticket } from '../../interfaces/ticket.model';
import { Bitacora } from '../../../shared/interfaces/bitacora.model';
import { BitacoraService } from '../../../shared/services/bitacora.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';

@Component({
  selector: 'app-ticket-tab-mitigacion',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  templateUrl: './ticket-tab-mitigacion.component.html',
  styleUrl: './ticket-tab-mitigacion.component.scss',
})
export class TicketTabMitigacionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() ticket!: Ticket;

  mitigaciones: Bitacora[] = [];
  ultimaMitigacion: Bitacora | null = null;
  private mitigacionSub?: Subscription;
  private currentTicketId?: string;

  constructor(
    private bitacoraService: BitacoraService,
    public datesHelper: DatesHelperService,
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
      this.mitigaciones = [];
      this.ultimaMitigacion = null;
      return;
    }

    this.mitigacionSub = this.bitacoraService
      .getBitacoras('TICKETS', this.currentTicketId, 'MITIGACION')
      .subscribe((data) => {
        if (data && data.length > 0) {
          this.ultimaMitigacion = data[data.length - 1];
          this.mitigaciones = data.slice().reverse();
        } else {
          this.ultimaMitigacion = null;
          this.mitigaciones = [];
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });
  }
}
