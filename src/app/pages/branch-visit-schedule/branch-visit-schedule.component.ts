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
@Component({
  selector: 'app-branch-visit-schedule',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ModalEventDetailComponent],
  templateUrl: './branch-visit-schedule.component.html',
})
export default class BranchVisitScheduleComponent implements OnInit {
public usuario: Usuario;
public arr_data:Visita[] = []; 
showModalEventeDetail: boolean = false;
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
      private visitasService:VisitasService
    )
    {
      this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
      let idu = this.usuario.uid;
    } 
  ngOnInit(): void { this.obtenerVisitas(); }

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
      this.showModalEventeDetail = true; 
    }
  
}
