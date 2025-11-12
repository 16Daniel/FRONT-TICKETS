import { Component, Input, OnInit } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import * as shape from 'd3-shape';
import { TicketsService } from '../../services/tickets.service';

@Component({
  selector: 'app-grafica-tickets-30-dias',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './grafica-tickets-30-dias.component.html',
  styleUrls: ['./grafica-tickets-30-dias.component.scss']
})
export class GraficaTickets30DiasComponent implements OnInit {
  @Input() idSucursal!: string;
  @Input() idArea!: string;

  data: any[] = [];
  colorScheme: Color = {
    name: 'azul',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#007bff']
  };

  curve: any = shape.curveBasis;
  // curve: any = shape.curveLinear;

  constructor(private ticketsService: TicketsService) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    const tickets = await this.ticketsService.getTicketsUltimos30Dias(this.idSucursal, this.idArea);
    console.log(tickets)

    // Crear un mapa de días → cantidad
    const conteoPorDia = new Map<string, number>();

    const hoy = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - i);
      const clave = d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
      conteoPorDia.set(clave, 0);
    }

    tickets.forEach(t => {
      const fecha = (t.fecha?.toDate?.() || new Date(t.fecha));
      const clave = fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
      if (conteoPorDia.has(clave)) {
        conteoPorDia.set(clave, (conteoPorDia.get(clave) || 0) + 1);
      }
    });

    this.data = [
      {
        name: 'TICKETS',
        series: Array.from(conteoPorDia.entries())
          .reverse()
          .map(([dia, cantidad]) => ({ name: dia, value: cantidad }))
      }
    ];

    console.log(this.data)
  }
}
