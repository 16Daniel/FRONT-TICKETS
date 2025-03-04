import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es'; // Importar idioma español
import { TicketsService } from '../../services/tickets.service';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../services/users.service';
import { VisitasService } from '../../services/visitas.service';
import { Usuario } from '../../models/usuario.model';
import { Timestamp } from '@angular/fire/firestore';
import { Visita } from '../../models/visita';
import ModalEventDetailComponent from "../../modals/Calendar/modal-event-detail/modal-event-detail.component";
import { BranchesService } from '../../services/branches.service';
import { Sucursal } from '../../models/sucursal.model';
import { PriorityTicketsAccordionComponent } from '../../components/tickets/priority-tickets-accordion/priority-tickets-accordion.component';
import { GuardiasService } from '../../services/guardias.service';
import { ModalTicketDetailComponent } from "../../modals/tickets/modal-ticket-detail/modal-ticket-detail.component";
import { Ticket } from '../../models/ticket.model';
@Component({
  selector: 'app-branch-visit-schedule',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ModalEventDetailComponent, ModalTicketDetailComponent],
  providers:[MessageService],
  templateUrl: './branch-visit-schedule.component.html',
})
export default class BranchVisitScheduleComponent implements OnInit {
public usuario: Usuario;
public arr_data:Visita[] = []; 
public sucursales:Sucursal[] = [];
public sucursalSeleccionada:Sucursal|undefined; 
public FechaSeleccionada:Date = new Date(); 
showModalTicketDetail: boolean = false;
showModalEventeDetail: boolean = false;
public itemtk: Ticket | undefined;
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: esLocale,
     // Botones de navegación y cambio de vista
     headerToolbar: {
      left: 'prev,next today', // Botones de navegación
      center: 'title', // Título del calendario
      right: 'dayGridMonth,timeGridWeek,timeGridDay', // Botones para cambiar vista
    },
    eventClick: this.handleEventClick.bind(this),
  };

   constructor(
      private ticketsService: TicketsService,
      private cdr: ChangeDetectorRef,
      private usersService: UsersService,
      private visitasService:VisitasService,
      private branchesService: BranchesService,
      private guardiasService:GuardiasService
    )
    {
      this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
      let idu = this.usuario.uid;
    } 
  ngOnInit(): void 
  {
     this.obtenerVisitas();
     this.obtenerSucursales(); 
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

  obtenerVisitas()
  {
    this.visitasService.get(this.usuario.uid).subscribe({
      next: (data) => {
        this.arr_data = data; 
        let eventos:any[] = []; 
        for(let item of this.arr_data)
          {
            for(let sucursal of item.sucursales)
              {
                eventos.push({title: sucursal.nombre, start:this.getDate(item.fecha),end:this.getDate(item.fecha),allDay:true});
              }
          } 
        this.obtenerGuardias(eventos); 
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  obtenerGuardias(eventos:any)
  {
    this.guardiasService.get(this.usuario.uid).subscribe({
      next: (data) => {
        this.arr_data = data;  
        for(let item of this.arr_data)
          {
            eventos.push({title:'GUARDIA', 
            start:this.getDate(item.fecha),
            end:this.getDate(item.fecha),
            allDay:true,
            color: '#e620b9', // Color personalizado (púrpura)
            textColor: '#ffffff' // Color del texto
           });
          }

        this.calendarOptions = { ...this.calendarOptions, events: eventos}; 
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

   getDate(tsmp: Timestamp): Date {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    }

    handleEventClick(clickInfo: EventClickArg) {
      console.log(clickInfo.event);

      let sucursal = this.sucursales.filter(x => x.nombre == clickInfo.event._def.title); 
      this.FechaSeleccionada = clickInfo.event.start!; 
      this.sucursalSeleccionada = sucursal[0]; 
      this.showModalEventeDetail = true; 
      this.cdr.detectChanges(); 
    }
  
}
