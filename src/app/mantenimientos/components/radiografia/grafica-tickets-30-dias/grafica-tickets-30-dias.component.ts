import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import * as shape from 'd3-shape';

import { TablaRadiografiaComponent } from '../tabla-radiografia/tabla-radiografia.component';
import { Ticket } from '../../../../tickets/models/ticket.model';
import { TicketsService } from '../../../../tickets/services/tickets.service';

@Component({
  selector: 'app-grafica-tickets-30-dias',
  standalone: true,
  imports: [NgxChartsModule, TablaRadiografiaComponent],
  templateUrl: './grafica-tickets-30-dias.component.html',
  styleUrls: ['./grafica-tickets-30-dias.component.scss']
})
export class GraficaTickets30DiasComponent implements OnInit {
  @Input() idSucursal!: string;
  @Input() idArea!: string;

  tickets: Ticket[] = [];

  data: any[] = [];
  colorScheme: Color = {
    name: 'azul',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#007bff']
  };

  // curve: any = shape.curveBasis;
  curve: any = shape.curveCatmullRom.alpha(0.5);
  // curve: any = shape.curveLinear;
  loading = true;

  constructor(
    private ticketsService: TicketsService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.tickets = await this.ticketsService.getTicketsUltimos30Dias(this.idSucursal, this.idArea);

    const conteoPorDia = new Map<string, number>();

    const hoy = new Date();

    // Crear los 30 días anteriores
    for (let i = 0; i < 30; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - i);

      const dia = d.toLocaleDateString('es-MX', { weekday: 'long' });
      const diaNumero = d.getDate();

      const claveNormalizada =
        `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${diaNumero}`;

      conteoPorDia.set(claveNormalizada, 0);
    }

    // Contar los tickets
    this.tickets.forEach(t => {
      const fecha = (t.fecha?.toDate?.() || new Date(t.fecha));

      const dia = fecha.toLocaleDateString('es-MX', { weekday: 'long' });
      const diaNumero = fecha.getDate();

      const claveNormalizada =
        `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${diaNumero}`;

      if (conteoPorDia.has(claveNormalizada)) {
        conteoPorDia.set(
          claveNormalizada,
          (conteoPorDia.get(claveNormalizada) || 0) + 1
        );
      }
    });

    // Pasar a la gráfica
    this.data = [
      {
        name: 'TICKETS',
        series: Array.from(conteoPorDia.entries())
          .reverse()
          .map(([dia, cantidad]) => ({
            name: dia,
            value: cantidad
          }))
      }
    ];

    this.loading = false;
    this.cdr.detectChanges();
  }


}
