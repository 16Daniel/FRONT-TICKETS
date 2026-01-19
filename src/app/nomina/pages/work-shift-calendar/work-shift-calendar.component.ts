import { FullCalendarComponent } from '@fullcalendar/angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es'; // Importar idioma español
import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { PuestoNomina, EmpleadoNomina, TurnodbNomina, TurnoNomina, UbicacionNomina, GuardarTurnoRequest } from '../../../models/Nomina';
import { NominaService } from '../../../services/nomina.service';
import { TurnosComponent } from "../../../modals/Nomina/Turnos/Turnos.component";
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ColorRandomService } from '../../../services/ColorRandom.service';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-work-shift-calendar',
  standalone: true,
  styleUrl:'./styles.scss',
  imports: [FullCalendarModule, CommonModule, DropdownModule, FormsModule, TurnosComponent,ToastModule,ColorPickerModule,ConfirmDialogModule],
  providers:[MessageService,ConfirmationService],
  templateUrl: './work-shift-calendar.component.html',
})
export default class WorkShiftCalendarComponent {
 @ViewChild('calendar') calendarComponent: FullCalendarComponent | undefined;
  @ViewChild('divform') div1!: ElementRef<HTMLElement>;
  @ViewChild('divCalendar') div2!: ElementRef<HTMLElement>;
  @ViewChild('divEventos') divEv!: ElementRef<HTMLElement>;

public colorevento:string = "#009bd8"; 
public departamentos:PuestoNomina[] = []; 
 public empleados:EmpleadoNomina[] = []; 
 public empleadosFiltro:EmpleadoNomina[] = []; 
 public ubicaciones:UbicacionNomina[] = []; 
 public turnos:TurnodbNomina[] = []; 
 public empleadosel:EmpleadoNomina|undefined;
 public ubicacionSel:UbicacionNomina|undefined; 
public mostrarModalTurnos:boolean = false; 
public departamentoSel:PuestoNomina = {idpuesto:-1,nombre:'TODO'};
public loading:boolean = false; 
 public data: Horario[] = [];

  constructor( public cdr: ChangeDetectorRef,public apiserv:NominaService,private messageService: MessageService,private colorService: ColorRandomService, private confirmationService: ConfirmationService){}

  // Eventos externos (arrastrables)
  externalEvents: ExternalEvent[] = [];
  
  ngOnInit(): void {
    this.getUbicaciones(); 
    this.getDepartamentos();
    this.getTurnos(); 
  }

   showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  @HostListener('window:resize')
  onResize() {
    this.updateDiv2Height();
  }

  updateDiv2Height() {
    const viewportHeight = window.innerHeight;
    const div1Height = this.div1.nativeElement.offsetHeight;
    const div2Height = viewportHeight - div1Height - 80;

    this.divEv.nativeElement.style.height = `${div2Height}px`;
    this.div2.nativeElement.style.height = `${div2Height}px`;
  }

    getDepartamentos()
  {
     this.apiserv.getDepartamentos().subscribe({
      next: data => {
         this.departamentos = data;
         this.departamentos.unshift({idpuesto:-1,nombre:'TODO'})
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });
  }

   getUbicaciones()
  {
     this.apiserv.getUbicaciones().subscribe({
      next: data => {
         this.ubicaciones = data;
         
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });

  }

   getTurnos()
  {
     this.apiserv.getTurnosdb().subscribe({
      next: data => {
         this.turnos = data;
         
         this.externalEvents = []; 
         for(let item of this.turnos)
          {
            this.externalEvents.push({id:item.idTurno.toString(),title:item.alias})
          }

          this.habilitarArrastre(); 
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });

  }

   getEmpleados(idUbicacion:number)
  {
     this.apiserv.getEmpleados(idUbicacion).subscribe({
      next: data => {
         this.empleados=data;
         this.empleadosFiltro = [...this.empleados]; 
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });

  }

  // Opciones de FullCalendar
  calendarOptions: CalendarOptions = {
    contentHeight: 'auto',
    initialView: 'dayGridWeek',
    plugins: [dayGridPlugin, interactionPlugin],
    locale: esLocale,
    editable: true,
    droppable: true,
    eventResizableFromStart: false, // no permite redimensionar desde el inicio
    eventDurationEditable: false,   // evita cambiar la duración
    eventOrder: 'id',
    firstDay: 0,
    dropAccept: (draggedEl) => {
    return this.empleadosel !== undefined; // Solo acepta si hay empleado seleccionado
  },
    eventReceive: (info) => {
    // Cancela el evento para evitar que se renderice automáticamente
    info.event.remove(); // Elimina el evento que FullCalendar agregó por defecto
     let id = info.draggedEl.getAttribute('data-id');
    if(!this.TurnoUnico(this.empleadosel!.id,info.event.start!))
      {
          this.showMessage('info','Error','Solo se puede agregar un turno por día a un empleado');
          return;
      }

      if(this.turnosSemanalesCompletos(this.empleadosel!.id,parseInt(id!)))
        {
           this.showMessage('info','Error','Solo se pueden agregar 6 turnos y un descanso por semama a cada empleado');
           return;
        } 

    let nombreturno = info.event.title
    debugger
    let posicion:number =  this.calendarComponent!.getApi().getEvents().length == 0 ? 0: parseInt(this.calendarComponent!.getApi().getEvents()[this.calendarComponent!.getApi().getEvents().length-1].id); 
    posicion++;
    // Ahora manejas tú el evento manualmente
    const newEvent:EventInput = {
      id:posicion.toString(),
      title: nombreturno,
      start: info.event.start!,
      allDay: true,
      backgroundColor: this.colorevento,
      textColor: this.getLuminance(this.colorevento) > 0.6 ? '#000000' : '#FFFFFF',
       extendedProps: {
        idEmp: this.empleadosel!.id,
        nombreEmpleado: this.empleadosel!.nombre,
        idTurno: id,
        plantilla: false,
        idPuesto: this.empleadosel!.departamento
      },
      borderColor:'#ffffff00',
    };
    this.calendarComponent!.getApi().addEvent(newEvent);
    this.reemplazareventoPlantilla(parseInt(id!),this.empleadosel!.departamento,info.event.start!)
  }
  };

  habilitarArrastre() {
    // Habilita el arrastre para los eventos externos
    new Draggable(document.getElementById('external-events')!, {
      itemSelector: '.external-event',
      eventData: function(eventEl) {
        return {
          title: eventEl.innerText
        };
      }
    });

    this.updateDiv2Height();
  }

    clearAllEvents() {
     let file = document.getElementById("excelFile") as HTMLInputElement;
     file.value = ''; 
    const calendarApi = this.calendarComponent!.getApi();
    calendarApi.removeAllEvents();
  }

  CambioDeUbicacion()
  {
    this.departamentoSel = {idpuesto:-1,nombre:'TODO'};
    this.empleados = []; 
    this.empleadosel = undefined; 
    this.getEmpleados(this.ubicacionSel!.idUbicacion);
  }
  
  cambioDeEmpleado()
  {
       this.colorevento = this.colorService.generarColor(); 
  }

  abrirModalturnos()
  {
    this.mostrarModalTurnos = true; 
  }

getLuminance(hexColor: string): number {
    if (hexColor == '') {
      return 0;
    } else {
      // Convertir el color hexadecimal a RGB
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      // Calcular la luminancia según la fórmula estándar
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
  }

  filtrarUsuarios()
  {
    this.empleadosel = undefined; 
      if(this.departamentoSel.idpuesto == -1)
        {
          this.empleadosFiltro = [...this.empleados]; 
        }else
        {
          let filtro = this.empleados.filter(x => x.departamento == this.departamentoSel.idpuesto);
          this.empleadosFiltro = [...filtro]; 
        }
  }


  confirmarGuardarTurnos()
  {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: `Se guardará toda la información del calenderio ¿Está seguro que desea continuar?`,
      acceptLabel: 'Aceptar', // 🔥 Cambia "Yes" por "Aceptar"
      rejectLabel: 'Cancelar', // 🔥 Cambia "No" por "Cancelar"
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
            this.GuardarTurnos(); 
      },
      reject: () => { },
    });
  }
  GuardarTurnos()
  {
     let turnos:GuardarTurnoRequest[] = []; 
     let eventos = this.calendarComponent!.getApi().getEvents(); 
     
     eventos = eventos.filter(x=> x.extendedProps['plantilla'] == false); 

     if(eventos.length == 0)
      {
        this.showMessage('info','Info','El calendario está vacío')
        return
      }
      this.loading = true; 
     for(let evento of eventos)
      {
        let idemp = evento.extendedProps['idEmp'];
        let idturno = evento.extendedProps['idTurno'];
        let fecha:Date = evento.start!; 
        fecha.setHours(0,0,0,0); 

         let item:GuardarTurnoRequest = 
         {
          claTrab: idemp,
          claEmpresa: 1,
          claTurno: idturno,
          fecha: fecha
         }

         turnos.push(item);

      }

      this.apiserv.guardarTurnosCalendario(turnos).subscribe({
      next: data => {
         this.showMessage('success', 'Success', 'Guardado correctamente'); 
         setTimeout(() => {
          window.location.reload(); 
         }, 1500);
         this.cdr.detectChanges();
      },
      error: error => {
        this.loading = false; 
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
         console.log(error);
      }
  });
  }

   TurnoUnico(idEmpleado:number, fecha:Date):boolean
  {
      let estatus:boolean = true;
      
      let eventos = this.calendarComponent!.getApi().getEvents(); 
      let filtro = eventos.filter(x=>x.start?.getFullYear() == fecha.getFullYear() && x.start.getMonth() == fecha.getMonth() && x.start.getDate() == fecha.getDate() && x.extendedProps['idEmp'] == idEmpleado); 
      estatus = filtro.length > 0 ? false:true;  
      return estatus
    }

    turnosSemanalesCompletos(idEmp:number,idTurno:number):boolean
    {
      let estatus:boolean = false; 
            const calendarApi = this.calendarComponent!.getApi();
        const view = calendarApi.view;
        const firstDate:Date = view.activeStart;
        let lastDate:Date = view.activeEnd;
        lastDate = new Date(lastDate.getTime() - (24 * 60 * 60 * 1000));
        let eventos = this.calendarComponent!.getApi().getEvents(); 

        let filtro = eventos.filter(x => x.extendedProps['idTurno'] != 0 && x.extendedProps['idEmp'] == idEmp && x.start!>=firstDate && x.start!<=lastDate);
         estatus = filtro.length <6 ? false:true; 
        
         if(idTurno == 0)
          {
             filtro = eventos.filter(x => x.extendedProps['idTurno'] == 0 && x.extendedProps['idEmp'] == idEmp && x.start!>=firstDate && x.start!<=lastDate);
             estatus = filtro.length > 0? true:false; 
          }

        return estatus; 
    }

      onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('No se puede usar múltiples archivos');
    
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      
      // Asume que el nombre de la hoja es 'SIMPLEX' como en tu ejemplo
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      
      // Convertir a JSON
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Procesar los datos según tu formato específico
      this.data = this.processExcelData(data);
      this.cargarPlantilla(); 
    };
    reader.readAsBinaryString(target.files[0]);
  }

  private processExcelData(data: any[]): Horario[] {
    const result: Horario[] = [];
    let currentDia = '';

    // Empezar desde la fila 2 para omitir los encabezados
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      
      // Si la columna A tiene valor, es un nuevo día
      if (row[0]) {
        currentDia = row[0];
      }
      
      // Verificar que todas las columnas necesarias tengan valores
      if (currentDia && row[1] && row[2] !== undefined && row[3] !== undefined) {
        result.push({
          dia: currentDia,
          turno: row[1],
          cocineros: row[2],
          vendedores: row[3]
        });
      }
    }

    return result;
  }

  cargarPlantilla()
  {
    debugger
    this.clearAllEvents();
     const calendarApi = this.calendarComponent!.getApi();
        const view = calendarApi.view;
        let firstDate:Date = view.activeStart;
    let indice = 0; 
      for(let i=0; i<7; i++)
        {  
          let cocinerosMat = this.data[indice].cocineros;
           let vendedoresMat = this.data[indice].vendedores;
          indice++;
          let cocinerosInter = this.data[indice].cocineros;
          let vendedoresInter = this.data[indice].vendedores;
          indice++;
          let cocinerosVes = this.data[indice].cocineros;
          let vendedoresVes = this.data[indice].vendedores;
          indice++;
          
          for(let cm = 0; cm<cocinerosMat; cm++)
            {
              let id= 'p-c-m-'+firstDate.getFullYear()+firstDate.getMonth()+firstDate.getDate()+cm; 
              let titulo = '🟡 COCINERO';
              let newEvent = this.getEventoPlantilla(id,titulo,firstDate,4003); 
               this.calendarComponent!.getApi().addEvent(newEvent);
            }

            for(let cm = 0; cm<cocinerosInter; cm++)
            {
              let id= 'p-c-i-'+firstDate.getFullYear()+firstDate.getMonth()+firstDate.getDate()+cm; 
              let titulo = '🟢 COCINERO';
              let newEvent = this.getEventoPlantilla(id,titulo,firstDate,4003); 
               this.calendarComponent!.getApi().addEvent(newEvent);
            }

            for(let cm = 0; cm<cocinerosVes; cm++)
            {
              let id= 'p-c-v-'+firstDate.getFullYear()+firstDate.getMonth()+firstDate.getDate()+cm; 
              let titulo = '🟣 COCINERO';
              let newEvent = this.getEventoPlantilla(id,titulo,firstDate,4003); 
               this.calendarComponent!.getApi().addEvent(newEvent);
            }

            //  ---------------------- VENDEDORES ------------------
             for(let v = 0; v<vendedoresMat; v++)
            {
              let id= 'p-v-m-'+firstDate.getFullYear()+firstDate.getMonth()+firstDate.getDate()+v; 
              let titulo = '🟡 VENDEDOR';
              let newEvent = this.getEventoPlantilla(id,titulo,firstDate,4005); 
               this.calendarComponent!.getApi().addEvent(newEvent);
            }

              for(let v = 0; v<vendedoresInter; v++)
            {
              let id= 'p-v-i-'+firstDate.getFullYear()+firstDate.getMonth()+firstDate.getDate()+v; 
              let titulo = '🟢 VENDEDOR';
              let newEvent = this.getEventoPlantilla(id,titulo,firstDate,4005); 
               this.calendarComponent!.getApi().addEvent(newEvent);
            }

              for(let v = 0; v<vendedoresVes; v++)
            {
              let id= 'p-v-v-'+firstDate.getFullYear()+firstDate.getMonth()+firstDate.getDate()+v; 
              let titulo = '🟣 VENDEDOR';
              let newEvent = this.getEventoPlantilla(id,titulo,firstDate,4005); 
               this.calendarComponent!.getApi().addEvent(newEvent);
            }


           firstDate = new Date(firstDate.getTime() + (24 * 60 * 60 * 1000));
        
        }
  }
 
  getEventoPlantilla(id:string,titulo:string,fecha:Date,idPuesto:number):EventInput
  {
     const newEvent:EventInput = {
                  id:id,
                  title: titulo,
                  start: fecha,
                  allDay: true,
                  backgroundColor: '#c8d5de',
                  textColor:'#000000',
                  extendedProps: {
                    plantilla: true,
                    idPuesto: idPuesto
                  },
                  borderColor:'#ffffff00',
                };
    return newEvent; 
  }

  reemplazareventoPlantilla(idTurno:number,idPuesto:number,fecha:Date)
  {
    if(this.data.length>0)
      {
        if(idTurno>0 && (idPuesto == 4003 || idPuesto == 4005))
          {
             const calendarApi = this.calendarComponent!.getApi();
             let eventos =  calendarApi.getEvents(); 
             let filtro = eventos.filter(x=>x.extendedProps['idPuesto'] == idPuesto && x.extendedProps['plantilla'] == true && x.start!.getFullYear() == fecha.getFullYear() &&  x.start!.getMonth() == fecha.getMonth() && x.start!.getDate() == fecha.getDate()); 
             if(filtro.length>0){  this.removeEventById(filtro[0].id);  }
          }
      }

  }

  removeEventById(eventId: string) {
    debugger
    const calendarApi = this.calendarComponent!.getApi();
    let eventos = calendarApi.getEvents(); 
    const event = calendarApi.getEventById(eventId);
    
    if (event) {
      event.remove();
      //console.log(`Evento con ID ${eventId} eliminado`);
    } else {
      //console.warn(`No se encontró el evento con ID ${eventId}`);
    }
  }

}

interface ExternalEvent {
  id: string;
  title: string;
}

interface Horario {
  dia: string;
  turno: string;
  cocineros: number;
  vendedores: number;
}
