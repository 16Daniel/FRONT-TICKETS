import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { itemConteo } from '../../interfaces/ConteoComensales';
@Component({
  selector: 'app-grafica-comensales',
  standalone: true,
  imports: [CommonModule,NgxChartsModule],
  providers:[DatePipe],
  templateUrl: './grafica-comensales.component.html',
  styleUrl: './grafica-comensales.component.scss',
})
export class GraficaComensalesComponent implements OnInit {
  @Input() data:itemConteo[] = []
  @Input() fechaIni:Date = new Date(); 
  @Input() fechaFin:Date = new Date(); 

  multi: any[] = [];
  view: any[] = [700, 300];
  // public colorScheme: any = {
  //   domain: [
  //     '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  //     '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
  //     '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
  //     '#795548', '#9E9E9E', '#607D8B', '#F44336', '#E57373',
  //     '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7',
  //     '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775',
  //     '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65', '#A1887F',
  //     '#90A4AE', '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
  //     '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA',
  //     '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740'
  //   ]
  // };

  public colorScheme: any = {
    domain: [
        '#D92500', '#EDBA00', '#009EED', '#45ED00', '#FF5400',
        '#06D6A0', '#FFD166', '#3A86FF', '#9B5DE5', '#8338EC',
        '#FF006E', '#00BBF9', '#6A040F', '#00509D', '#FB5607',
        '#2A9D8F', '#FF9E00', '#9C89B8', '#38B000', '#F15BB5'
    ]
};

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'FECHA';
  yAxisLabel: string = 'COMENSALES';
  timeline: boolean = true;

  constructor(private datePipe: DatePipe,public cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void 
  { 
    this.multi = []; 
    const nombresUnicos = [...new Set(this.data.map(s => s.nombreSuc))];
  
    for(let nombreSuc of nombresUnicos)
      {
          let fecha:Date = new Date(this.fechaIni);  
          let series:any[] = []; 
           while(fecha<=this.fechaFin)
            {
              let dia = this.datePipe.transform(fecha, 'dd-MM-yyyy')!;

              let datadia = this.data.filter(x=> x.fecha.toDate().getDate() == fecha.getDate()
              && x.fecha.toDate().getMonth() == fecha.getMonth() && x.fecha.toDate().getFullYear() == fecha.getFullYear() && x.nombreSuc == nombreSuc); 
              
              let comensales = 0; 
              for(let itemsuc of datadia)
                {
                  comensales = comensales + itemsuc.comensales;   
                }
                let promedio = 0; 
                if(datadia.length>0)
                  { promedio = comensales/datadia.length;} 
                else { promedio = 0;}
                series.push({name:dia,value:promedio});
                fecha.setDate(fecha.getDate()+1);   
            }
            this.multi.push({name:nombreSuc,series:series});
           
    }
  }

}
