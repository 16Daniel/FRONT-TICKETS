import { ChangeDetectorRef, Component, Input, input, ViewChild, type OnInit } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es'; // Importar idioma español
import { VisitasService } from '../../../services/visitas.service';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { GuardiasService } from '../../../services/guardias.service';
import { Usuario } from '../../../models/usuario.model';
import { Ticket } from '../../../models/ticket.model';
import ModalEventDetailComponent from "../../../modals/Calendar/modal-event-detail/modal-event-detail.component";
import { Sucursal } from '../../../models/sucursal.model';
import { Mantenimiento10x10 } from '../../../models/mantenimiento-10x10.model';
import { DocumentsService } from '../../../services/documents.service';
import { ColorUsuario } from '../../../models/color-usuario';
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ModalEventDetailComponent],
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
@Input() usuariosHelp:Usuario[] = [];
@Input() tickets:Ticket[] = []; 
@Input() sucursales:Sucursal[] = [];
@Input() mantenimientos:Mantenimiento10x10[] = [];  
public comentario:string = ''; 
public sucursalSeleccionada:Sucursal|undefined; 
public FechaSeleccionada:Date = new Date(); 
showModalEventeDetail: boolean = false;
public colores:ColorUsuario[] = []; 

@ViewChild('calendar') calendarComponent: FullCalendarComponent|undefined;
loading:boolean = false; 
calendarOptions: CalendarOptions = {
  initialView: 'dayGridWeek',
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  locale: esLocale,
   // Botones de navegación y cambio de vista
   headerToolbar: {
    left: 'prev,next today', // Botones de navegación
    center: 'title', // Título del calendario
    right: '', // Botones para cambiar vista
  },
  datesSet: this.obtenerFechas.bind(this), // Evento para obtener fechas
  eventClick: this.handleEventClick.bind(this),
  eventOrder:'order'
};

constructor(private visitasService:VisitasService,private guardiasService:GuardiasService,private cdr: ChangeDetectorRef,private documentService:DocumentsService){}
  ngOnInit(): void 
  {
    this.obtenerColores(); 
   }

  obtenerFechas(info: any) {
    
    let fechaini:Date = info.start; 
    let fechafin:Date = info.end; 

    fechafin.setHours(0,0,0,0);
    fechaini.setHours(0,0,0,0);

    this.mostrarEventos(fechaini,fechafin);

  }

    getDate(tsmp: Timestamp): Date {
        // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
        const firestoreTimestamp = tsmp; // Ejemplo
        const date = firestoreTimestamp.toDate(); // Convierte a Date
        return date;
      }
  

  async mostrarEventos(fechaIni:Date,fechaFin:Date)
  {   
    this.loading= true; 
    let visitas = await this.visitasService.obtenerVisitaFechas(fechaIni,fechaFin);  
    let guardias = await this.guardiasService.obtenerGuardiasFechas(fechaIni,fechaFin);
    let calendarApi = this.calendarComponent!.getApi();
    calendarApi.removeAllEvents(); 
    let contador = 1; 
    for(let guardia of guardias)
      {
        calendarApi.addEvent({title:'GUARDIA', 
          start:this.getDate(guardia.fecha),
          end:this.getDate(guardia.fecha),
          allDay:true,
          color: this.obtenerColor(guardia.idUsuario),
          textColor: this.getLuminance(this.obtenerColor(guardia.idUsuario)) > 0.6 ? '#000000' : '#FFFFFF', // Color del texto
          extendedProps: 
          {
            idUsuario: guardia.idUsuario
          },
          order:contador
         }
        );
        contador++;
      }
    for(let visita of visitas)
      {
        let comentario = '';
        for(let sucursal of visita.sucursales)
          {
            let temp = visita.comentarios.filter(x => x.idSucursal == sucursal.id); 
            comentario = temp.length>0 ? temp[0].comentario : '';
            calendarApi.addEvent({title: sucursal.nombre, start:this.getDate(visita.fecha),
              end:this.getDate(visita.fecha),allDay:true,
              color: this.obtenerColor(visita.idUsuario),
              textColor: this.getLuminance(this.obtenerColor(visita.idUsuario)) > 0.6 ? '#000000' : '#FFFFFF', // Color del texto
              extendedProps:
              {
                idSucursal:sucursal.id,
                idUsuario:visita.idUsuario,
                comentario:comentario
              },
              order:contador
            });
            contador++; 
          }
      }

      this.loading= false;
      this.cdr.detectChanges();
  }

  obtenerNombreUsuario(idUsuario:string):string
  {
    let nombre = '';
    let temp = this.usuariosHelp.filter(x => x.id == idUsuario);
    if(temp.length>0){nombre = temp[0].nombre + ' ' + temp[0].apellidoP; }
    return nombre
  }

  obtenerTicketsPorSucursal(idSucursal:string) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }
  
  handleEventClick(clickInfo: EventClickArg) {
   
    if(clickInfo.event.title != 'GUARDIA')
      {
        let sucursal = this.sucursales.filter(x => x.nombre == clickInfo.event._def.title); 
        this.FechaSeleccionada = clickInfo.event.start!; 
        this.comentario = clickInfo.event.extendedProps['comentario']; 
        this.sucursalSeleccionada = sucursal[0]; 
        this.showModalEventeDetail = true; 
        this.cdr.detectChanges(); 
      }
  }

  obtenerMantenimientoSucursal(idSucursal:string):Mantenimiento10x10[]
  {
    return this.mantenimientos.filter(x => x.idSucursal == idSucursal); 
  }

  obtenerColores()
  {
    this.documentService.get('colores-usuarios').subscribe({
      next: (data) => {
          this.colores = data;  
        this.cdr.detectChanges();
      },
      error: (error) => {
      },
    });
  }

  obtenerColor(idUsuario:string):string
  {
    let color = ''; 
    let temp = this.colores.filter(x=>x.idUsuario == idUsuario);
    color = temp.length>0 ? temp[0].color : ''; 
    return color; 
  }

  getLuminance(hexColor: string): number {
    if(hexColor == '')
      {
        return 0; 
      } else
      {
            // Convertir el color hexadecimal a RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calcular la luminancia según la fórmula estándar
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      }
  }

}
