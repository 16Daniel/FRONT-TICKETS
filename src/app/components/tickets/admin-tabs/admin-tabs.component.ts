import { ChangeDetectorRef, Component} from '@angular/core';
import { TicketsService } from '../../../services/tickets.service';
import { Sucursal } from '../../../models/sucursal.model';
import { Usuario } from '../../../models/usuario.model';
import { Subscription } from 'rxjs';
import { Ticket } from '../../../models/ticket.model';
import { TabViewModule } from 'primeng/tabview';
import { AdminSysTabComponent } from "../admin-sys-tab/admin-sys-tab.component";
import { AdminAudioVideoTabComponent } from "../admin-audio-video-tab/admin-audio-video-tab.component";

@Component({
  selector: 'app-admin-tabs',
  standalone: true,
  imports: [TabViewModule, AdminSysTabComponent, AdminAudioVideoTabComponent],
  templateUrl: './admin-tabs.component.html',
})
export class AdminTabsComponent {
  sucursal: Sucursal;
  usuario: Usuario;
  subscripcionTicket: Subscription | undefined;
  loading: boolean = false;
  tickets: Ticket[] = [];
  public todosLostickets: Ticket[] = [];
  ticket: Ticket | undefined;

  private unsubscribe!: () => void;

  constructor(private ticketsService: TicketsService, private cdr: ChangeDetectorRef,

  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario.sucursales[0];
  }

  ngOnDestroy() {
    if (this.subscripcionTicket != undefined) {
      this.subscripcionTicket.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  refrescar()
  {
    this.cdr.detectChanges(); 
  }
}
