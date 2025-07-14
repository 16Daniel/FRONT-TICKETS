import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { NominaService } from '../../../services/nomina.service';
import { EmpleadoHorario, Marcajes, PuestoNomina, TurnodbNomina } from '../../../models/Nomina';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { KnobModule } from 'primeng/knob';
import { ProgressBarModule } from 'primeng/progressbar';
@Component({
  selector: 'app-staff-control',
  standalone: true,
  imports: [CommonModule,FormsModule,TableModule,KnobModule,ProgressBarModule],
  templateUrl: './staff-control.component.html',
  styleUrl: './staff-control.component.scss',
})
export default class StaffControlComponent implements OnInit {
public marcajes:Marcajes[] = [];
public horarios:EmpleadoHorario[] = []; 
public puestosDeTrabajo:any[] = []; 
public loading:boolean = false; 
public porcentajePersonal:number = 100;
public vg:number = 91;  
public value75:number = 75; 
public turnos:TurnodbNomina[] = []; 
public horaActual: number = 0; 
public turnoActual:string = ""; 
public departamentos:PuestoNomina[] = []; 
    constructor( public cdr: ChangeDetectorRef,public apiserv:NominaService){}
  ngOnInit(): void 
  {
    setInterval(() => {
      this.actualizarTurno(); 
    }, 60000);
    this.getDepartamentos(); 
    this.obtenercalendario(); 
    this.getTurnos(); 
   }

       getDepartamentos()
  {
     this.apiserv.getDepartamentos().subscribe({
      next: data => {
         this.departamentos = data;
         this.obtenerMarcajes(); 
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });
  }

   actualizarTurno()
   {
      if(this.turnos.length>0)
        {
           this.horaActual= this.getHoraActual(); 
           for(let turno of this.turnos)
            {
                let horaInicioturno = parseInt(turno.alias.split(' ')[1].split(':')[0]); 
                if(turno.idTurno>0 && this.horaActual >= horaInicioturno)
                  {
                    this.turnoActual = turno.alias; 
                  }
            }
        }
   }

   getHoraActual(): number {
  return new Date().getHours();
}

   getMinutosActual(): number {
  return new Date().getMinutes();
}

  obtenerMarcajes()
  { 
    this.loading = true; 
    const hoy = new Date();  
    const sieteDiasEnMilisegundos = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos  
    const fecha = new Date(hoy.getTime() - sieteDiasEnMilisegundos); 
    this.apiserv.consultarMarcajes(2,fecha,fecha).subscribe({
      next: data => {
         this.marcajes = data;
         console.log(data); 
         this.loading = false;   
         this.cdr.detectChanges();
      },
      error: error => {
        this.loading = false; 
         console.log(error);
      }
  });
  }


  obtenercalendario()
  { 
    this.loading = true; 
    const hoy = new Date();  
    const sieteDiasEnMilisegundos = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos  
    const fecha = new Date(hoy.getTime() - sieteDiasEnMilisegundos); 
    this.apiserv.consultarCalendario(2,fecha).subscribe({
      next: data => {
         this.horarios = data;
         console.log(this.horarios); 
         this.loading = false;   

         let puestosunicos = [...new Set(this.horarios.map(emp => emp.nom_puesto))];

         for(let puesto of puestosunicos)
          {
            this.puestosDeTrabajo.push({nombre:puesto,porcentaje:0,contar:false}); 
          }
         this.cdr.detectChanges();
      },
      error: error => {
        this.loading = false; 
         console.log(error);
      }
  });
  }

obtenerEmpleadosPuesto(item:any):string[]
{
   this.horaActual= this.getHoraActual(); 
   let puestotemp = this.departamentos.filter(x => x.nombre.trim() == item.nombre.trim());
   let idpuesto = puestotemp[0].idpuesto; 
  let data = this.horarios.filter(x=> x.nom_puesto.trim() == item.nombre.trim() && x.cla_turno >0); 
  let temp:EmpleadoHorario[] = []; 
  for(let item of data)
    {
      let horaEntrada:number = 0; 
      if(item.entrada.length >3)
        {
          horaEntrada = parseInt(item.entrada.substring(0,2)); 
        } else
        {
         horaEntrada = parseInt(item.entrada.substring(0,1)); 
        }
      if(horaEntrada <= this.horaActual)
        {
          temp.push(item); 
        }
    }

    let empleadosRequeridos = temp.length; 
    let empleadosMarcaje = 0; 

    let empleadosMarcajes = this.marcajes.filter(x => x.idpuesto == idpuesto); 

    for(let emp of empleadosMarcajes)
      {    
        if(emp.entrada != "" && this.esHoraMenorQueActual(emp.entrada))
          {  
               empleadosMarcaje++; 
          }
      
      }

      let verdes = empleadosMarcaje; 
      let rojos = 0; 
      if(empleadosRequeridos<empleadosMarcaje)
        {
          rojos = empleadosRequeridos- empleadosMarcaje; 
        }

        let colores:string[]=[];

        for (let index = 0; index < verdes; index++) {
          colores.push('text-success'); 
        }

        for (let index = 0; index < rojos; index++) {
          colores.push('text-danger'); 
        }
       
        if(empleadosMarcaje>0 && empleadosRequeridos >0)
          {
                let porcentaje = (empleadosMarcaje/empleadosRequeridos)*100;
               item.porcentaje =parseInt(porcentaje.toString());
          }else
          {
                 item.porcentaje = 0;
          }
               
       this.porcentajeGeneral(); 
        return colores;  
}

esHoraMenorQueActual(horaString: string): boolean {
  const [hora, minutos] = horaString.split(':').map(Number);

  const ahora = new Date();
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
  const minutosComparar = hora * 60 + minutos;

  return minutosComparar < minutosActuales;
}

   getTurnos()
  {
     this.apiserv.getTurnosdb().subscribe({
      next: data => {
         this.turnos = data;
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });

  }

obtenerNombrePuesto(idPuesto:number):string
{
  let temp = this.departamentos.filter(x=> x.idpuesto == idPuesto);
  let nombre = temp.length > 0 ? temp[0].nombre : '';  
  return nombre; 
}

porcentajeGeneral()
{
  let total = 0; 
  let puestos = this.puestosDeTrabajo.filter(x =>x.contar == true); 
  total = puestos.reduce((acumulador, item) => acumulador + item.porcentaje, 0);
  if(total > 0)
    {
      this.porcentajePersonal = (total/puestos.length)*100; 
    } else
    {
      this.porcentajePersonal = 0; 
    }
}
}
