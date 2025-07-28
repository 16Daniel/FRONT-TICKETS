import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { NominaService } from '../../../services/nomina.service';
import { Correonotificacion, EmpleadoHorario, Marcajes, PuestoNomina, TurnodbNomina } from '../../../models/Nomina';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { KnobModule } from 'primeng/knob';
import { ProgressBarModule } from 'primeng/progressbar';
import { CorreosNotificacionService } from '../../../services/correos-notificacion.service';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';
import { Usuario } from '../../../models/usuario.model';
@Component({
  selector: 'app-staff-control',
  standalone: true,
  imports: [CommonModule,FormsModule,TableModule,KnobModule,ProgressBarModule,DropdownModule,ToastModule],
   providers: [MessageService],
  templateUrl: './staff-control.component.html',
  styleUrl: './staff-control.component.scss',
})
export default class StaffControlComponent implements OnInit {
public marcajes:Marcajes[] = [];
public horarios:EmpleadoHorario[] = []; 
public puestosDeTrabajo:any[] = []; 
public loading:boolean = false; 
public turnos:TurnodbNomina[] = []; 
public horaActual: number = 0; 
public turnoActual:string = ""; 
public departamentos:PuestoNomina[] = []; 
public correos:Correonotificacion[] = []; 
public correoSel:Correonotificacion|undefined; 
public sucursales: Sucursal[] = []; 
public sucursalSel:Sucursal|undefined; 
public usuario:Usuario; 
    constructor( public cdr: ChangeDetectorRef,public apiserv:NominaService,
      public correoService:CorreosNotificacionService,
      private messageService: MessageService, 
        private branchesService:BranchesService 
    )
    {
       this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    }
  ngOnInit(): void 
  {
    this.getCorreos(); 
    setInterval(() => {
      this.actualizarTurno(); 
      this.consultar(); 
    }, 60000);

     this.obtenerSucursales(); 
    this.getDepartamentos(); 
    this.obtenercalendario(); 
    this.getTurnos(); 
   }

   consultar()
   {
    this.getDepartamentos(); 
    this.obtenercalendario(); 
    this.getTurnos(); 
   }

       getCorreos()
  {
     this.correoService.get().subscribe({
      next: data => {
         this.correos= data;
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });
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
    this.apiserv.consultarMarcajes(this.sucursalSel!.claUbicacion!,hoy,hoy).subscribe({
      next: data => {
         this.marcajes = data;
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
    this.apiserv.consultarCalendario(this.sucursalSel!.claUbicacion!,hoy).subscribe({
      next: data => {
         this.horarios = data;
         this.loading = false;   
          this.puestosDeTrabajo = []; 
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
      let horaSalida:number = 0; 
      if(item.entrada.length >3)
        {
          horaEntrada = parseInt(item.entrada.substring(0,2)); 
        } else
        {
         horaEntrada = parseInt(item.entrada.substring(0,1)); 
        }

         if(item.salida.length >3)
        {
          horaSalida = parseInt(item.salida.substring(0,2)); 
        } else
        {
         horaSalida = parseInt(item.salida.substring(0,1)); 
        }

      if(horaEntrada <= this.horaActual && horaSalida> this.horaActual)
        {
          temp.push(item); 
        }
    }

    let empleadosRequeridos = temp.length; 
    let empleadosMarcaje = 0; 

    let empleadosMarcajes = this.marcajes.filter(x => x.idpuesto == idpuesto); 

    for(let emp of empleadosMarcajes)
      {    
        if(emp.entrada != "" && this.esHoraMenorQueActual(emp.entrada) && this.EsRequerido(emp))
          {  
               empleadosMarcaje++; 
          }
      
      }

      let verdes = empleadosMarcaje; 
      let rojos = 0; 
      if(empleadosMarcaje<empleadosRequeridos)
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


obtenerFondo(item:Marcajes):string
{
    let fondo = ""; 
    let itemhorario = this.horarios.filter(x => x.cla_trab == item.cla_trab)[0]; 
    if(itemhorario)
      {
        if(itemhorario.cla_turno == 0)
          {
            fondo = "bg-warning"
          } else
            {
              if(item.entrada!="")
                {
                  fondo = "bg-success"; 
                }else
                  {
                    fondo = "bg-danger"
                  }
            }
      }
      else{
        fondo = "bg-warning"; 
      }
    return fondo; 
}

obtenerEntradacalendario(item:Marcajes):string
{
  let hora = "--"; 
      let itemhorario = this.horarios.filter(x => x.cla_trab == item.cla_trab)[0];
      if(itemhorario)
        {
          if(itemhorario.cla_turno == 0)
            {
              hora = "DESCANSO";  
            } 
            else
              {
                if(itemhorario.entrada.length>3)
                  {
                        let horaE = itemhorario.entrada.substring(0,2); 
                        let minutosE = itemhorario.entrada.substring(2,4); 
                        hora = horaE+":"+minutosE; 
                  }else
                    {
                          let horaE = itemhorario.entrada.substring(0,1); 
                        let minutosE = itemhorario.entrada.substring(1,3); 
                        hora = horaE+":"+minutosE; 
                    }
              }
        }
  return hora; 
}

EsRequerido(item:Marcajes):boolean
{
  let value:boolean = false;
    let itemhorario = this.horarios.filter(x => x.cla_trab == item.cla_trab)[0];
      if(itemhorario)
        {   
          if(itemhorario.cla_turno == 0)
            {
              value = false; 
            } else
              {
                 let horaEntrada:number = 0; 
              let horaSalida:number = 0; 
              if(itemhorario.entrada.length >3)
                {
                  horaEntrada = parseInt(itemhorario.entrada.substring(0,2)); 
                } else
                {
                horaEntrada = parseInt(itemhorario.entrada.substring(0,1)); 
                }

                if(itemhorario.salida.length >3)
                {
                  horaSalida = parseInt(itemhorario.salida.substring(0,2)); 
                } else
                {
                horaSalida = parseInt(itemhorario.salida.substring(0,1)); 
                }
           if(horaEntrada <= this.horaActual && horaSalida> this.horaActual)
              {
                value = true; 
              }
              }
            
        }
  return value; 
}

formulariocorreo():boolean
{
   let found = false;
    const elements = document.querySelectorAll('.bx-user.text-danger');
      if (elements.length > 0) {
        found = true;
      }
    return found;
}

enviarCorreo()
{
   this.loading = true;
  if(this.correoSel == undefined)
    {
      this.showMessage("info","Error","Seleccionar regional")
      return; 
    }

    let data:any[] = []; 
    for(let item of this.puestosDeTrabajo)
      {
        let colores = this.obtenerEmpleadosPuesto(item);
        if(colores.filter(x=> x == "text-danger").length>0)
          {
            data.push({nombrepuesto:item.nombre,empleadosRequeridos:colores.length,empleadosFaltantes:colores.filter(x=> x == "text-danger").length}); 
          }
      }
  this.apiserv.enviarCorreo(this.sucursalSel!.idFront!,this.correoSel.nombre,this.correoSel!.correo,JSON.stringify(data)).subscribe({
      next: data => {
        this.loading = false; 
        this.showMessage("success","Success","enviado correctamente");
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });

}

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

async obtenerSucursales() {

        this.loading = true; 
       try {
        this.sucursales = await this.branchesService.getOnce();
          this.sucursales.filter(x=> x.idFront && x.claUbicacion); 
          if(this.usuario.idRol=='2')
            {
              let suc = this.sucursales.filter(x=>x.id == this.usuario.sucursales[0].id)[0]; 
              this.sucursalSel = suc; 
            } else
              {
                this.sucursalSel = this.sucursales[0]; 
              }
           this.loading = false; 
           this.cdr.detectChanges();
      } catch (error) {
      }
      }

}
