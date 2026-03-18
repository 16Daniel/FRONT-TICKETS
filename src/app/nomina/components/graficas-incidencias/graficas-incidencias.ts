import { Component, input, Input, type OnInit } from '@angular/core';
import { HistorailPersonal } from '../../interfaces/Nomina';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-graficas-incidencias',
  standalone: true,
  imports: [CommonModule,NgxChartsModule,SelectButtonModule,FormsModule],
  templateUrl: './graficas-incidencias.html',
  styleUrl: './graficas-incidencias.scss',
})
export class GraficasIncidencias implements OnInit {
@Input() Alldata:HistorailPersonal[] = [];
@Input() sucursales:Sucursal[] = [];
public graficaFaltas: any[] = [];
public graficaVacaciones: any[] = [];
public graficaIncapacidad: any[] = [];
public GraficaSel:string =  "1";
  colorScheme: any = {
     domain: [
      '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
      '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
      '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
      '#795548', '#9E9E9E', '#607D8B', '#F44336', '#E57373',
      '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7',
      '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775',
      '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65', '#A1887F',
      '#90A4AE', '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
      '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA',
      '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740'
    ]
  };

      stateOptions: any[] = [
        { label: 'FALTAS', value: '1' },
        { label: 'VACACIONES', value: '2'},
        { label: 'INCAPACIDAD', value: '3'},
    ];

ngOnInit(): void 
{
  this.generarGraficaFaltas(); 
  this.generarGraficaVacaciones(); 
  this.generarGraficaIncapacidad();
 }

  generarGraficaFaltas()
{ 
  this.graficaFaltas = []; 
  for(let datasuc of this.Alldata)
    {
              for (let dia of datasuc.data) {
                let faltas = dia.incidencias.filter(x => x.regbitacora == null && !x.incidencia.toLowerCase().includes("vacaciones") && !x.incidencia.toLowerCase().includes("incapacidad") ).length;
                
                let nombreSuc = this.sucursales.filter(x=>x.claUbicacion == datasuc.claubicacion)[0].nombre; 
                if(dia.empleadosrequeridos>0)
                  {
                    let porcentaje = (faltas / dia.empleadosrequeridos) * 100;
                    this.graficaFaltas.push({name:nombreSuc,value:porcentaje});
                  } else
                    {
                      let porcentaje = 0; 
                      this.graficaFaltas.push({name:nombreSuc,value:porcentaje});
                    }
              }
    } 
}

  generarGraficaVacaciones()
{ 
  this.graficaVacaciones = []; 
  for(let datasuc of this.Alldata)
    {
              for (let dia of datasuc.data) {
                let faltas = dia.incidencias.filter(x => x.regbitacora == null && x.incidencia.toLowerCase().includes("vacaciones")).length;
                
                let nombreSuc = this.sucursales.filter(x=>x.claUbicacion == datasuc.claubicacion)[0].nombre; 
                if(dia.empleadosrequeridos>0)
                  {
                    let porcentaje = (faltas / dia.empleadosrequeridos) * 100;
                    this.graficaVacaciones.push({name:nombreSuc,value:porcentaje});
                  } else
                    {
                      let porcentaje = 0; 
                      this.graficaVacaciones.push({name:nombreSuc,value:porcentaje});
                    }
              }
    } 
}

  generarGraficaIncapacidad()
{ 
  this.graficaIncapacidad = []; 
  for(let datasuc of this.Alldata)
    {
              for (let dia of datasuc.data) {
                let faltas = dia.incidencias.filter(x => x.regbitacora == null && x.incidencia.toLowerCase().includes("incapacidad") ).length;
                
                let nombreSuc = this.sucursales.filter(x=>x.claUbicacion == datasuc.claubicacion)[0].nombre; 
                if(dia.empleadosrequeridos>0)
                  {
                    let porcentaje = (faltas / dia.empleadosrequeridos) * 100;
                    this.graficaIncapacidad.push({name:nombreSuc,value:porcentaje});
                  } else
                    {
                      let porcentaje = 0; 
                      this.graficaIncapacidad.push({name:nombreSuc,value:porcentaje});
                    }
              }
    } 
}


}
