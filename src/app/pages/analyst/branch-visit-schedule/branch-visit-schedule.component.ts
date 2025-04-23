import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es'; // Importar idioma español
import { TicketsService } from '../../../services/tickets.service';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../../services/users.service';
import { VisitasService } from '../../../services/visitas.service';
import { Usuario } from '../../../models/usuario.model';
import { Timestamp } from '@angular/fire/firestore';
import { Visita } from '../../../models/visita-programada';
import ModalEventDetailComponent from "../../../modals/calendar/modal-event-detail/modal-event-detail.component";
import { BranchesService } from '../../../services/branches.service';
import { Sucursal } from '../../../models/sucursal.model';
import { PriorityTicketsAccordionComponent } from '../../../components/tickets/priority-tickets-accordion/priority-tickets-accordion.component';
import { GuardiasService } from '../../../services/guardias.service';
import { ModalTicketDetailComponent } from "../../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component";
import { Ticket } from '../../../models/ticket.model';
import { CalendarComponent } from "../../../components/common/calendar/calendar.component";
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { ColorUsuario } from '../../../models/color-usuario';
import { DocumentsService } from '../../../services/documents.service';
import { Maintenance10x10Service } from '../../../services/maintenance-10x10.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-branch-visit-schedule',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ModalEventDetailComponent, CalendarComponent],
  providers:[MessageService],
  templateUrl: './branch-visit-schedule.component.html',
})
export default class BranchVisitScheduleComponent implements OnInit {
public usuariosHelp:Usuario[] = [];
public colorUsuario:ColorUsuario|undefined;  
public tickets: Ticket[] = [];
public arr_ultimosmantenimientos:Mantenimiento10x10[] = []; // <--- revisar
public usuario: Usuario;
public arr_data:Visita[] = []; 
public sucursales:Sucursal[] = [];
public sucursalSeleccionada:Sucursal|undefined; 
public FechaSeleccionada:Date = new Date(); 
showModalTicketDetail: boolean = false;
showModalEventeDetail: boolean = false;
public itemtk: Ticket | undefined;
public colores:ColorUsuario[] = []; 
public loading:boolean = true;  
subscriptiontk: Subscription | undefined;

   constructor(
      private ticketsService: TicketsService,
      private cdr: ChangeDetectorRef,
      private usersService: UsersService,
      private branchesService: BranchesService,
      private messageService:MessageService,
      private documentService:DocumentsService,
      private mantenimientoService: Maintenance10x10Service,
    )
    {
      this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    } 

    showMessage(sev: string, summ: string, det: string) {
      this.messageService.add({ severity: sev, summary: summ, detail: det });
    }

  ngOnInit(): void 
  {
     this.obtenerSucursales(); 
     this.obtenerUsuariosHelp();
     this.obtenerTodosLosTickets(); 
     this.obtenerColores();
  }

  obtenerColores()
  {
    this.documentService.get('colores-usuarios').subscribe({
      next: (data) => {
          this.colores = data;  
          let temp =  this.colores.filter(x => x.idUsuario == this.usuario.id);
          this.colorUsuario = temp.length>0 ? temp[0] : undefined; 
        this.cdr.detectChanges();
      },
      error: (error) => {
      },
    });
  }

  obtenerUsuariosHelp() {
    this.usersService.get().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.usuariosHelp = this.usuariosHelp.filter(x => x.idRol == '4'); 
         this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
       console.log(error);
      },
    });
  }
  
  async obtenerTodosLosTickets(): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.ticketsService
      .get()
      .subscribe({
        next: (data) => {
          this.tickets = []; 
          this.tickets = data;
          let arr_temp: Ticket[] = [];
          let temp1: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '1'
          );
          let temp2: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '2'
          );
          let temp3: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '3'
          );
          let temp4: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '4'
          );

          temp1 = temp1.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp2 = temp2.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp3 = temp3.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp4 = temp4.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );
          arr_temp = [...temp1, ...temp2, ...temp3, ...temp4];
          this.tickets = arr_temp;

          if (this.itemtk != undefined) {
            let temp = this.tickets.filter((x) => x.id == this.itemtk!.id);
            if (temp.length > 0) {
              this.itemtk = temp[0];
            }
          }
        
          this.obtnerUltimosMantenimientos();  
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }


  obtnerUltimosMantenimientos() {
    let sucursales: Sucursal[] = [...this.sucursales];
    let array_ids_Sucursales: string[] = [];

    for (let item of sucursales) {
      array_ids_Sucursales.push(item.id);
    }

    this.loading = true;
    this.subscriptiontk = this.mantenimientoService
      .getUltimosMantenimientos(array_ids_Sucursales)
      .subscribe({
        next: (data) => {
          this.arr_ultimosmantenimientos = data.filter(
            (elemento): elemento is Mantenimiento10x10 => elemento !== null
          );
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los mantenimientos:', error);
        },
      });
  }

  obtenerNombreUsuario(idUsuario:string):string
  {
    let nombre = '';
    let temp = this.usuariosHelp.filter(x => x.id == idUsuario);
    if(temp.length>0){nombre = temp[0].nombre + ' ' + temp[0].apellidoP; }
    return nombre
  }

}
