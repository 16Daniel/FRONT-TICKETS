import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, map, of, Subscription, switchMap } from 'rxjs';
import { TabViewModule } from 'primeng/tabview';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AcordeonTicketsPorSucursalComponent } from '../../../tickets/components/acordeon-tickets-por-sucursal/acordeon-tickets-por-sucursal.component';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { Comite } from '../../interfaces/comite';
import { ComitesService } from '../../services/comites.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tickets-comites-page',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    PageHeaderComponent,
    AcordeonTicketsPorSucursalComponent,
  ],
  providers: [MessageService],
  templateUrl: './tickets-comites-page.html',
  styleUrl: './tickets-comites-page.scss',
})
export class TicketsComitesPage implements OnInit, OnDestroy {
  sucursales: Sucursal[] = [];
  errorSucursales = '';
  private sucursalesSub?: Subscription;

  readonly comitesConTickets$ = this.comitesService.comites$.pipe(
    switchMap((comites) => {
      const comitesConId = comites.filter(
        (comite): comite is Comite & { id: string } => Boolean(comite.id),
      );

      if (!comitesConId.length) return of([]);

      return combineLatest(
        comitesConId.map((comite) =>
          this.ticketsService.getByComite(comite.id).pipe(
            map((tickets) => ({ ...comite, tickets })),
          ),
        ),
      );
    }),
  );

  constructor(
    private comitesService: ComitesService,
    private ticketsService: TicketsService,
    private branchesService: BranchesService,
  ) {}

  obtenerSucursalesConTickets(tickets: Ticket[]): Sucursal[] {
    const idsSucursales = new Set(
      tickets
        .map((ticket) => ticket.idSucursal)
        .filter((idSucursal) => idSucursal !== null && idSucursal !== undefined && idSucursal !== '')
        .map((idSucursal) => String(idSucursal)),
    );

    return this.sucursales.filter(
      (sucursal) => sucursal.id != null && idsSucursales.has(String(sucursal.id)),
    );
  }

  ngOnInit(): void {
    this.sucursalesSub = this.branchesService.get().subscribe({
      next: (sucursales) => {
        this.sucursales = sucursales;
        this.errorSucursales = '';
      },
      error: (error: unknown) => {
        console.error('Error al obtener el catálogo de sucursales:', error);
        this.errorSucursales = 'No se pudo cargar el catálogo de sucursales.';
      },
    });
  }

  ngOnDestroy(): void {
    this.sucursalesSub?.unsubscribe();
  }
}
