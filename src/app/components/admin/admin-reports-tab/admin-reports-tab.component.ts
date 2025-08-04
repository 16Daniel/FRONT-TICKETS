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
import { AreasService } from '../../../services/areas.service';
import { Area } from '../../../models/area.model';
import { GraficaGeneralTicketsComponent } from "./graficas/grafica-general-tickets/grafica-general-tickets.component";
import { Subscription } from 'rxjs';
import { Usuario } from '../../../models/usuario.model';
import { UsersService } from '../../../services/users.service';
import { tick } from '@angular/core/testing';
import { CategoriesService } from '../../../services/categories.service';
import { Categoria } from '../../../models/categoria.mdoel';
import { StatusTicketService } from '../../../services/status-ticket.service';
import { EstatusTicket } from '../../../models/estatus-ticket.model';
import { MultiSelectModule } from "primeng/multiselect";
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';

@Component({
  selector: 'app-admin-reports-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, DropdownModule, ToastModule, GraficaGeneralTicketsComponent, MultiSelectModule],
   providers:[MessageService],
  templateUrl: './admin-reports-tab.component.html',
  styleUrl: './admin-reports-tab.component.scss',
})
export default class AdminReportsTabComponent implements OnInit {
public sucursales: Sucursal[] = [];
public sucursalesSel: Sucursal[] = [];
public loading:boolean = false; 
fechaini:Date = new Date(); 
fechafin:Date = new Date(); 
tickets: Ticket[] = [];
todosLosTickets: Ticket[] = [];
public areas: Area[] = [];
public areasSel: Area[] = [];
subscripcionUsuarios: Subscription | undefined;
catusuarios: Usuario[] = [];
usuariosFiltro:Usuario[] = []; 
categorias: Categoria[] = [];
estatusTicket: EstatusTicket[] = [];
public mesesDistintos:string[] = []; 
public manteniminetos:Mantenimiento10x10[] = []; 
public finalizado:boolean = false; 
constructor(
  public aceiteService:AceiteService,
  public cdr:ChangeDetectorRef,
  private branchesService: BranchesService,
  private messageService: MessageService,
  private ticketsService: TicketsService,
  private areasService: AreasService,
  private usersService: UsersService,
  private categoriesService: CategoriesService,
   private statusTicketService: StatusTicketService,
   private mantenimientosService: Maintenance10x10Service,
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
 this.obtenerUsuarios();
 this.obtenerCategorias(); 
 this.obtenerEstatusTicket(); 
}
  
  obtenerCategorias() {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
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
        this.sucursales = data;
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false; 
      },
    });
  }


  async obtenerTickets(): Promise<void> {
    this.tickets = []; 
    this.todosLosTickets = []; 
    this.manteniminetos = []; 
    this.loading = true; 
    this.finalizado = false; 
      this.tickets = await this.ticketsService.obtenerTicketsEntreFechas(
      this.fechaini,
      this.fechafin
    );
    
    for(let suc of this.sucursalesSel)
      { let tks = this.tickets.filter(x=> x.idSucursal == suc.id); 
          this.todosLosTickets.push(...tks); 
      }
      this.todosLosTickets = this.todosLosTickets.filter(x=> this.areasSel.some(a=> a.id == x.idArea)); 
      this.usuariosFiltro = this.catusuarios.filter(u => this.areasSel.some(a=> a.id == u.idArea)); 
      let temp:Usuario[] = []; 
      for(let uf of this.usuariosFiltro)
        {
             const existeSucursal = this.sucursalesSel.some(sucSeleccionada =>
                  uf.sucursales.some(sucUsuario => 
                      sucUsuario.id === sucSeleccionada.id
                  )
              );

              if(existeSucursal)
                {
                    temp.push(uf); 
                }
        }
        this.usuariosFiltro = [...temp]; 
        this.mesesDistintos = this.obtenerMesesDistintos(this.fechaini,this.fechafin); 
      
      this.obtenerMantenimientosSys(); 
  }

  async obtenerMantenimientosSys(): Promise<void>
  {
      this.manteniminetos = await this.mantenimientosService.obtenerMantenimientosEntreFechas(
      this.fechaini,
      this.fechafin);

    this.loading = false; 
    this.finalizado = true; 
    this.cdr.detectChanges(); 
  }

   obtenerUsuarios() {
    this.subscripcionUsuarios = this.usersService.get().subscribe({
      next: (data) => {
        this.catusuarios = data
        this.loading = false;
        if (data.length == 0) {
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

   obtenerEstatusTicket() {
    this.statusTicketService.get().subscribe({
      next: (data) => {
        this.estatusTicket = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }


  obtenerMesesDistintos(fechaInicio: Date, fechaFin: Date, formato: string = 'MM/YYYY'): string[] {
  const mesesUnicos = new Set<string>();
  
  if (fechaInicio > fechaFin) {
    [fechaInicio, fechaFin] = [fechaFin, fechaInicio];
  }
  
  const fechaActual = new Date(fechaInicio);
  fechaActual.setDate(1); // Nos aseguramos de empezar desde el primer día del mes
  
  while (fechaActual <= fechaFin) {
    const mes = fechaActual.getMonth() + 1; // meses van de 0 a 11
    const año = fechaActual.getFullYear();
    
    let mesFormateado = formato
      .replace('MM', mes.toString().padStart(2, '0'))
      .replace('YYYY', año.toString());
    
    mesesUnicos.add(mesFormateado);
    
    // Avanzar al siguiente mes
    fechaActual.setMonth(fechaActual.getMonth() + 1);
  }
  
  return Array.from(mesesUnicos).sort();
}

cambiarareas()
{
  this.tickets = []; 
  this.manteniminetos = []; 
}
}
