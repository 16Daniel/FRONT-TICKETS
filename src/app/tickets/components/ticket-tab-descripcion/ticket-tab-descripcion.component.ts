import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Ticket } from '../../interfaces/ticket.model';

@Component({
  selector: 'app-ticket-tab-descripcion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-tab-descripcion.component.html',
  styleUrl: './ticket-tab-descripcion.component.scss',
})
export class TicketTabDescripcionComponent {
  @Input() ticket!: Ticket;
}
