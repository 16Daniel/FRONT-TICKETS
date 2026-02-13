import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { Checada, Empleado, Evento, itable, Reporte, ReporteDia, Ubicacion } from '../../interfaces/Checadas';
import { MessageService } from 'primeng/api';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ChecadasService } from '../../services/checadas.service';
import { addDays } from '@fullcalendar/core/internal';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { GraficaHorasTrabajo } from "../../components/grafica-horas-trabajo/grafica-horas-trabajo";
@Component({
  selector: 'app-checadas-page',
  standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    GraficaHorasTrabajo
],
  providers:[MessageService,DatePipe],
  templateUrl: './checadas-page.html',
  styleUrl: './checadas-page.scss',
})
export default class ChecadasPage implements OnInit {
 public catdepartamentos:Ubicacion[] = []; 
  public catempleados:Empleado[] = []; 
  public arr_semanas:number[] = []; 
  public arr_checadas:Checada[] = [];
  public eventos:Evento[] = []; 
  public reporte:Reporte | undefined;
  public reportedias:ReporteDia[] = []; 
  public tabledia:itable[] = []; 
  public diassemana:string[] = ['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'];

  public departamentosel:Ubicacion | undefined; 
  public empleadosel:Empleado | undefined; 
  public semanasel:number =0;  
  public nombreemp:string =""; 
  public loading:boolean = false; 
  public calculado:boolean = false;
  public semanaselc:number =0; 
  public now:Date = new Date(); 
  public fechaIni:Date = new Date();
  public fechaFin:Date = new Date();

  constructor(public apiserv:ChecadasService, public cdr:ChangeDetectorRef,private messageService: MessageService,private datePipe: DatePipe)
{
  this.getdepartamentos(); 
  
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24; // Milisegundos en un día
  const dayOfYear = Math.floor(diff / oneDay);
  let numsemanas:number = 0; 
  if((dayOfYear/7)%7==0)
  {
    numsemanas = dayOfYear/7;
  } else
  {
    numsemanas = Math.floor(dayOfYear/7);
    numsemanas++;
  }

  for(let i=1;i<=numsemanas;i++)
  {
    this.arr_semanas.push(i);
  }  
   

 for(let i=0; i<7; i++)
 {
    this.reportedias.push({
      fecha:new Date(),
      calendarizadas:0,
      calendarizadas_visitadas:0,
      visitas_no_calendarizadas:0, 
      total_visitas:0,
      cumplimiento:0, 
      horas_laboradas:0, 
      tabla:[] 
   });
 }
}


  ngOnInit(): void 
  {
    this.getdepartamentos(); 
   }

   showMessage(sev:string,summ:string,det:string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
   getdepartamentos()
   {
     this.apiserv.getDepartamentos().subscribe({
       next: data => {
          this.catdepartamentos=data;
          this.cdr.detectChanges();
       },
       error: error => {
          console.log(error);
          this.showMessage('error',"Error","Error al procesar la solicitud");
       }
   });
   } 

   semanacalendario()
{  
  this.semanaselc = 0; 
  for(let i=0; i<this.semanasel;i++)
  {
    if(this.semanaselc==4)
    {
      this.semanaselc = 1; 
    } else { this.semanaselc++; }
  }
}

   getempleados()
{

  this.apiserv.getEmpleados(this.departamentosel!.id).subscribe({
    next: data => {
       this.catempleados=data;
       this.cdr.detectChanges();
    },
    error: error => {
       console.log(error);
       this.showMessage('error',"Error","Error al procesar la solicitud");
    }
});

}  

firstMondayOfYear(year: number): Date {
  const firstDayOfMonth = new Date(year, 0, 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // Domingo es 0, Lunes es 1, ..., Sábado es 6
  let daysToAdd = 0;
  if (dayOfWeek !== 1) { // Si no es Lunes
    daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // Calcular los días para llegar al primer Lunes
  }
  return new Date(year, 0, 1 + daysToAdd);
}

consultar()
{  

  if(this.departamentosel == undefined)
  {
    this.showMessage('info','Info','Seleccione un puesto de trabajo');
    return;
  }
  if(this.empleadosel == undefined)
  {
    this.showMessage('info','Info','Seleccione un empleado');
    return;
  }

  this.calculado= false;
  this.loading = true; 

  //////////////////////////////////////////////////////////////////////////////
  let temp = this.catempleados.filter(e=> e.id==this.empleadosel!.id);
  this.nombreemp = temp[0].nombre +" "+ temp[0].apellidop +" "+ temp[0].apellidom;

  
  this.apiserv.getChecadas(this.empleadosel!.id,this.datePipe.transform(this.fechaIni, 'yyyy-MM-dd')!,this.datePipe.transform(this.fechaFin, 'yyyy-MM-dd')!).subscribe({
    next: data => {
       this.arr_checadas = data; 
       this.tabledia = []; 
       this.calcularData(this.fechaIni,this.fechaFin); 
    },
    error: error => {
       console.log(error);
       this.showMessage('error',"Error","Error al procesar la solicitud");
    }
});

} 

calcularData(fechaIni:Date,fechaFin:Date)
{ 
  let fecha:Date = new Date(fechaIni); 

  let ubicaciones = [...new Set(this.arr_checadas.map(s => s.cla_reloj))];
  
  while(fecha<fechaFin)
  {
    for(let claUbicacion of ubicaciones)
    {
      let datadia = this.arr_checadas.filter(x => {
  const fechaX = new Date(x.fecha);
  return fechaX.getDate() == fecha.getDate() &&
         fechaX.getMonth() == fecha.getMonth() &&
         fechaX.getFullYear() == fecha.getFullYear() &&
         x.cla_reloj == claUbicacion;
});
       
        if(datadia.length==1)
        {
          let dataItem:itable = 
          {
            sucursal: datadia[0].nom_reloj, 
            fecha: new Date(fecha),
            entrada: datadia[0].fecha,
            salida: '',
            estadia: 0
          }
           this.tabledia.push(dataItem);
        }
       
       if(datadia.length>1)
        {
          let dataItem:itable = 
          {
            sucursal: datadia[0].nom_reloj, 
            fecha: new Date(fecha),
            entrada: datadia[0].fecha,
            salida: datadia[datadia.length-1].fecha,
            estadia: 0
          }

          dataItem.estadia = this.getHourDifference(dataItem.entrada,dataItem.salida);
          this.tabledia.push(dataItem);
        }

    }
      fecha.setDate(fecha.getDate() +1); 
  }

  this.loading = false; 
  this.cdr.detectChanges();
}

getHourDifference(startDate: Date, endDate: Date): number {
  let hi:Date = new Date(startDate);
  let hf:Date = new Date(endDate);
  const diffInMs = hf.getTime() - hi.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return diffInHours;
}

validateTimeDifference(startDate: Date, endDate: Date): boolean {
  const diffInMs = Math.abs(startDate.getTime() - endDate.getTime());
  const diffInMinutes = Math.ceil(diffInMs / (1000 * 60));
  return diffInMinutes > 30; // Verifica si la diferencia es mayor a 30 minutos
}

getTotalHorasTrabajadas():number
{
  let total = 0; 
  for(let item of this.tabledia)
    {
      total = total + item.estadia; 
    }
  return total; 
}

}
