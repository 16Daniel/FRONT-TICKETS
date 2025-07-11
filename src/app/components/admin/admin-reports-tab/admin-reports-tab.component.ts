import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { Sucursal } from '../../../models/sucursal.model';
import { AceiteService } from '../../../services/aceite.service';
import { BranchesService } from '../../../services/branches.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TicketsService } from '../../../services/tickets.service';
import { Ticket } from '../../../models/ticket.model';
import { id, NgxChartsModule } from '@swimlane/ngx-charts';
import { AreasService } from '../../../services/areas.service';
import { Area } from '../../../models/area.model';
import { GraficaGeneralTicketsComponent } from "./graficas/grafica-general-tickets/grafica-general-tickets.component";

@Component({
  selector: 'app-admin-reports-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, DropdownModule, ToastModule, GraficaGeneralTicketsComponent],
   providers:[MessageService],
  templateUrl: './admin-reports-tab.component.html',
  styleUrl: './admin-reports-tab.component.scss',
})
export class AdminReportsTabComponent implements OnInit {
public sucursales: Sucursal[] = [];
public sucursalSel: Sucursal|undefined;
public loading:boolean = false; 
fechaini:Date = new Date(); 
fechafin:Date = new Date(); 
tickets: Ticket[] = [];
todosLosTickets: Ticket[] = [];
public areas: Area[] = [];
 private unsubscribe!: () => void;


constructor(
  public aceiteService:AceiteService,
  public cdr:ChangeDetectorRef,
  private branchesService: BranchesService,
  private messageService: MessageService,
  private ticketsService: TicketsService,
  private areasService: AreasService,
)
{

}
   showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

ngOnInit(): void 
{
 this.obtenerAreas(); 
 this.obtenerSucursales();
}
  
  obtenerAreas() {
    this.areasService.get().subscribe({
      next: (data) => {
        this.areas = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }
  
  obtenerSucursales() {
      this.loading = true; 
    this.branchesService.get().subscribe({
      next: (data) => {
        let sucursalTodas:Sucursal = { id:'-1',nombre:'TODAS',idFront:-1,eliminado:false}
        this.sucursales = data;
        this.sucursales.unshift(sucursalTodas); 
        this.sucursalSel = sucursalTodas; 
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false; 
      },
    });
  }


  async obtenerTickets(): Promise<void> {
    this.loading = true; 
    this.unsubscribe = this.ticketsService.obtenerTicketsEntreFechas(
      this.fechaini,
      this.fechafin,
      (tickets: any) => {
        if (tickets) {
          this.tickets = tickets;
        } else {
          tickets = []; 
        }
        this.todosLosTickets = [...this.tickets];
           this.loading = false; 
           this.cdr.detectChanges();
      }
    );
  }

}
