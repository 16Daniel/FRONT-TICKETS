import { Component, Input, input, type OnInit } from '@angular/core';
import { Ticket } from '../../../../../models/ticket.model';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Area } from '../../../../../models/area.model';

@Component({
  selector: 'app-grafica-general-tickets',
  standalone: true,
  imports: [NgxChartsModule,CommonModule,FormsModule],
  templateUrl: './grafica-general-tickets.component.html',
})
export class GraficaGeneralTicketsComponent implements OnInit {
@Input() todosLosTickets: Ticket[] = []; 
@Input() areas: Area[] = [];
single: any[] =[];
  multi: any[]= [];
  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'ÁREA';
  showYAxisLabel = true;
  yAxisLabel = 'TICKETS';

  colorScheme:any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  ngOnInit(): void 
  {
    let areasdistintas = [...new Set(this.todosLosTickets.map(x => x.idArea))];
          
         this.single = []; 
         for(let ida of areasdistintas)
          {
            let nombrearea = this.areas.filter(x=> x.id == ida)[0].nombre;
            let total = this.todosLosTickets.filter(x=> x.idArea == ida).length; 
            
            this.single.push({name:nombrearea,value:total});
          }
   }

}
