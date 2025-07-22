import { Component, Input, input, RendererFactory2, type OnInit } from '@angular/core';
import { Ticket } from '../../../../../models/ticket.model';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Area } from '../../../../../models/area.model';
import { Usuario } from '../../../../../models/usuario.model';
import { Categoria } from '../../../../../models/categoria.mdoel';
import { EstatusTicket } from '../../../../../models/estatus-ticket.model';
import { Sucursal } from '../../../../../models/sucursal.model';
import { Mantenimiento10x10 } from '../../../../../models/mantenimiento-10x10.model';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-grafica-general-tickets',
  standalone: true,
  imports: [CommonModule,FormsModule,NgxChartsModule],
   providers: [
     { provide: RendererFactory2, useValue: RendererFactory2 }
  ],
  templateUrl: './grafica-general-tickets.component.html',
})
export class GraficaGeneralTicketsComponent implements OnInit {
@Input() todosLosTickets: Ticket[] = []; 
@Input() areas: Area[] = [];
@Input() usuarios:Usuario[] = []; 
@Input() categorias:Categoria[] = []; 
@Input() catEstatusTicket:EstatusTicket[] = []; 
@Input() meses:string[] = [];
@Input() sucursalesSel: Sucursal[] = [];
@Input() mantenimientos:Mantenimiento10x10[] = []; 
public usuariosSoporte:Usuario[] = []; 
gCategorias:any[] = []; 
  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'ÁREA';
  showYAxisLabel = true;
  yAxisLabel = 'TICKETS';

  colorSchemeG:any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  colorSchemeTurnos:any = {
    domain: ['#f3890a','#890af3']
  };
colorSchemeCategorias: any = {
  domain: [
    '#FF6F61', // Coral
    '#6B5B95', // Púrpura grisáceo
    '#88B04B', // Verde oliva claro
    '#FFA500', // Naranja
    '#00BFFF', // Azul profundo cielo
    '#FF69B4', // Rosa fuerte
    '#8B0000', // Rojo oscuro
    '#20B2AA', // Verde azulado
    '#FFD700', // Dorado
    '#7FFF00', // Verde neón
    '#DC143C', // Carmesí
    '#00CED1', // Turquesa oscuro
    '#40E0D0', // Turquesa claro
    '#9932CC', // Violeta oscuro
    '#F4A460', // Marrón arena
    '#4682B4', // Azul acero
    '#C71585', // Rosa violeta oscuro
    '#DAA520', // Mostaza dorado
    '#FF4500', // Rojo anaranjado
    '#B0C4DE'  // Azul grisáceo claro
  ]
};
public coloresEstatus:any; 
  ngOnInit(): void 
  {
    let domainCatEst:string[] = []; 
    for(let estatus of this.catEstatusTicket)
      {
        domainCatEst.push(estatus.color); 
      }

      this.coloresEstatus = {domain: domainCatEst}; 

    this.usuariosSoporte = this.usuarios.filter(x=>x.idRol == '4');
     this.generarGraficaPorCategoria();  
   }  

   generarGraficaGeneral():any[]
   {
      
         let data:any[] = []; 
         
    for(let mesanio of this.meses)
      { 
        let series:any[] = []; 
        for(let area of this.areas)
          {
            let ticketsmes = this.todosLosTickets.filter(x => x.fecha.toDate().getMonth()+1 == parseInt(mesanio.split('/')[0]) 
            && x.fecha.toDate().getFullYear() == parseInt(mesanio.split('/')[1])
            && x.idArea == area.id
          ).length; 

          series.push({name: area.nombre,value:ticketsmes}); 
          }         
          data.push({name:this.obtenerMesYAnioEspanol(mesanio).nombreMes,series:series}); 
      }
    //  let ticketsmes = this.todosLosTickets.filter(x => x.fecha.toDate().getMonth()+1 == parseInt(mesanio.split('/')[0]) && x.fecha.toDate().getFullYear() == parseInt(mesanio.split('/')[1]) ); 
    //    let areasdistintas = [...new Set(ticketsmes.map(x => x.idArea))];
        
    //      for(let ida of areasdistintas)
    //       {
    //         let series:any[] = []; 
    //         let nombrearea = this.areas.filter(x=> x.id == ida)[0].nombre;
    //           let tkarea = ticketsmes.filter(x=> x.idArea == ida); 

    //         let tkcorporativo = 0; 
    //         for(let tk of tkarea)
    //           {
    //               if(this.esCoporporativo(tk.idUsuario))
    //                 {
    //                   tkcorporativo++; 
    //                 }
    //           }                      
    //           series.push({name:'CORPORATIVO',value:tkcorporativo});
    //           series.push({name:'SUCURSAL',value:tkarea.length-tkcorporativo});
    //         data.push({name:nombrearea,series:series});
    //       }
          return data
   }
 
     generarGraficaPorCategoria()
   {
       let areasdistintas = [...new Set(this.todosLosTickets.map(x => x.idArea))];
         this.gCategorias = []; 
         for(let ida of areasdistintas)
          {
            let series:any[] = []; 
            let nombrearea = this.areas.filter(x=> x.id == ida)[0].nombre;
              let tkarea = this.todosLosTickets.filter(x=> x.idArea == ida); 
              
               let categoriasdistintas = [...new Set(tkarea.map(x => x.idCategoria))];
               for(let cat of categoriasdistintas)
                {
                  let nombrecat = this.categorias.filter(x=> x.id == cat)[0].nombre; 
                  let total = tkarea.filter(x => x.idCategoria == cat).length; 
                  series.push({name:nombrecat,value:total}); 
                }

                this.gCategorias.push({name:nombrearea,series:series}); 
          }
   }

   esfinDeSemana(fecha:Date):boolean {
    const dia = fecha.getDay();
    return dia === 0 || dia === 6 ? true : false;
}

   generarGraficaPorTurnos():any[]
   {    
        let gTurnos:any[] = []; 

        let ticketsmes = this.todosLosTickets; 
        let areasdistintas = [...new Set(ticketsmes.map(x => x.idArea))];
        
             // Filtrar elementos entre 9 AM y 6 PM
        const ticketsmetutinos = ticketsmes.filter(item => {
            let fecha:Date = item.fecha.toDate(); 
          const horas = fecha.getHours();
          const minutos = fecha.getMinutes();
          const totalHoras = horas + minutos / 60;
          let esFin:boolean = this.esfinDeSemana(fecha);
          
          return totalHoras >= 9 && totalHoras < 19 && esFin == false;
        });

        // Filtrar elementos fuera del horario
        const ticketsVespertinos = ticketsmes.filter(item => {
          let fecha:Date = item.fecha.toDate(); 
          const horas = fecha.getHours();
          const minutos = fecha.getMinutes();
          const totalHoras = horas + minutos / 60;
          let esFin:boolean = this.esfinDeSemana(fecha);
          return totalHoras < 9 || totalHoras >= 18 || esFin;
        });

         for(let ida of areasdistintas)
          {
            let nombrearea = this.areas.filter(x=> x.id == ida)[0].nombre;
  
            let tkm = ticketsmetutinos.filter(x=> x.idArea == ida).length;  
            let tkg = ticketsVespertinos.filter(x=> x.idArea == ida).length; 

              let series:any[] = []; 
             series.push({name:'MATUTINO',value:tkm});
             series.push({name:'GUARDIA',value:tkg});
             gTurnos.push({name:nombrearea,series:series});
          }

          return gTurnos; 
   }
   

   datosGraficaUsuario(usuario:Usuario):any[]
   {
      let dataGU:any[] = []

      let sucursales = usuario.sucursales; 

      for(let suc of sucursales)
        {
          let series:any[] = []; 
          for(let estatus of this.catEstatusTicket)
            {
               let tickets =  this.todosLosTickets.filter(x=> x.idSucursal == suc.id && x.idEstatusTicket == estatus.id).length;
               series.push({name:estatus.nombre,value:tickets});  
            }

            // series.sort((a, b) => b.value - a.value); 
          dataGU.push({name:suc.nombre,series:series}); 
        } 

                  dataGU = dataGU
            .map(group => ({
              ...group,
              total: group.series.reduce((acc:any, item:any) => acc + item.value, 0)
            }))
            .sort((a, b) => b.total - a.total) // Ordenar de mayor a menor
            .map(({ total, ...rest }) => rest);

      return dataGU; 
   } 

   esCoporporativo(idUsuario:string):boolean
   {
    let value:boolean = false; 
    let usuario:Usuario = this.usuarios.filter(X=>X.id == idUsuario)[0]; 
    if(usuario != undefined)
      {
              if(usuario.idRol == '3' )
              {
                value = true; 
              }
      }
    return value
   }

   obtenerNombredeArea(ida:number):string
   {
       return this.areas.filter(x=> x.id == ida).length>0 ? this.areas.filter(x=> x.id == ida)[0].nombre : '';
   }

   obtenerMesYAnioEspanol(mesAnio: string) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const [mes, anio] = mesAnio.split('/').map(Number);
  
  return {
    nombreMes: meses[mes - 1],
    anio: anio
  };
}

generarGraficaMantenimientos():any[]
{
  debugger
  let sucursales = this.sucursalesSel.filter(x => x.idFront != undefined || x.idFront != null); 
  let data:any[] = [];
  
  for(let sucursal of sucursales)
    {   
      let series:any[] = []; 
      for(let mes of this.meses)
        {
          let totalm = this.mantenimientos.filter(x => this.obtenerDate(x.fecha!).getMonth()+1 == parseInt(mes.split('/')[0]) 
            && this.obtenerDate(x.fecha!).getFullYear() == parseInt(mes.split('/')[1])
            && x.idSucursal == sucursal.id
          );
          let total = totalm.length;  
          series.push({name:this.obtenerMesYAnioEspanol(mes).nombreMes,value:total});
        }
      data.push({name:sucursal.nombre,series:series}); 

    }

  return data; 
}

obtenerDate(fecha:Timestamp|Date):Date
{ 
   // Si es un Timestamp de Firebase (o similar)
  if (typeof fecha === 'object' && 'toDate' in fecha) {
    return fecha.toDate();
  }
  
  // Si ya es un objeto Date o puede convertirse directamente
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error('Fecha no válida proporcionada');
  }
  return date;
}

}
