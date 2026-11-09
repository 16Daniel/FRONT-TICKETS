import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickListModule } from 'primeng/picklist';
import { Subscription } from 'rxjs';

import { VisitaItemEspecialComponent } from '../visita-item-especial/visita-item-especial.component';
import { TarjetaSucursalPorVisitarComponent } from '../tarjeta-sucursal-por-visitar/tarjeta-sucursal-por-visitar.component';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { MantenimientoSys } from '../../interfaces/mantenimiento-sys.interface';
import { VisitaProgramada } from '../../interfaces/visita-programada.interface';
import { Guardia } from '../../../tickets/interfaces/guardia';
import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';

@Component({
  selector: 'app-visita-sucursales-picklist',
  standalone: true,
  imports: [
    CommonModule,
    PickListModule,
    VisitaItemEspecialComponent,
    TarjetaSucursalPorVisitarComponent,
  ],
  templateUrl: './visita-sucursales-picklist.component.html',
  styleUrl: './visita-sucursales-picklist.component.scss',
})
export class VisitaSucursalesPicklistComponent implements OnChanges {
  @Input() sucursales: Sucursal[] = [];
  @Input() sucursalesOrdenadas: Sucursal[] = [];
  @Output() sucursalesOrdenadasChange = new EventEmitter<Sucursal[]>();

  @Input() sucursalesSeleccionadas: Sucursal[] = [];
  @Output() sucursalesSeleccionadasChange = new EventEmitter<Sucursal[]>();

  @Input() usuariosHelp: Usuario[] = [];
  @Input() usuarioSeleccionado: Usuario | undefined;
  @Input() usuarioActual!: Usuario;
  @Input() fecha: Date = new Date();
  @Input() tickets: Ticket[] = [];
  @Input() registroDeVisita: VisitaProgramada | undefined;
  @Input() registroDeGuardia: Guardia | undefined;

  @Output() listasActualizadas = new EventEmitter<void>();

  ultimosMantenimientos: MantenimientoSys[] = [];
  private ordenarxmantenimiento: boolean = false;
  private subMantenimientos?: Subscription;

  constructor(
    private mantenimientoFactory: MantenimientoFactoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursales'] && this.sucursales.length > 0 && this.usuarioActual) {
      this.obtenerUltimosMantenimientos();
    }

    if (
      changes['usuarioSeleccionado'] ||
      changes['registroDeVisita'] ||
      changes['registroDeGuardia']
    ) {
      if (this.usuarioSeleccionado) {
        this.construirListasSucursales();
      }
    }
  }

  obtenerUltimosMantenimientos(): void {
    const arrayIdsSucursales = this.sucursales.map((s) => s.id);
    const servicio = this.mantenimientoFactory.getService(this.usuarioActual.idArea);
    this.subMantenimientos?.unsubscribe();
    this.subMantenimientos = servicio.getUltimosMantenimientos(arrayIdsSucursales).subscribe({
      next: (data: any) => {
        this.ultimosMantenimientos = data.filter(
          (elemento: any): elemento is MantenimientoSys => elemento !== null
        );
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al escuchar los mantenimientos:', error);
      },
    });
  }

  construirListasSucursales(): void {
    this.sucursalesSeleccionadas = [];
    this.sucursalesOrdenadas = [];

    if (!this.usuarioSeleccionado) {
      this.emitirCambios();
      return;
    }

    const sucursalesDisponibles = this.sucursales.filter(
      (sucursal) =>
        !this.usuarioSeleccionado!.sucursales.some(
          (sucursalUsuario) => sucursalUsuario.id === sucursal.id
        )
    );

    let sucursalesDelUsuarioOrdenadas = this.ordenarSucursalesUser([
      ...this.usuarioSeleccionado.sucursales,
    ]);

    if (
      sucursalesDelUsuarioOrdenadas.length > 0 &&
      this.obtenerTicketsPorSucursal(sucursalesDelUsuarioOrdenadas[0].id).length === 0
    ) {
      this.ordenarxmantenimiento = true;
      sucursalesDelUsuarioOrdenadas = this.ordenarSucursalesUser([
        ...this.usuarioSeleccionado.sucursales,
      ]);
      this.ordenarxmantenimiento = false;
    }

    let sucursalesDisponiblesOrdenadas = this.ordenarSucursalesUser([
      ...sucursalesDisponibles,
    ]);

    if (
      sucursalesDisponiblesOrdenadas.length > 0 &&
      this.obtenerTicketsPorSucursal(sucursalesDisponiblesOrdenadas[0].id).length === 0
    ) {
      this.ordenarxmantenimiento = true;
      sucursalesDisponiblesOrdenadas = this.ordenarSucursalesUser([
        ...sucursalesDisponibles,
      ]);
      this.ordenarxmantenimiento = false;
    }

    this.sucursalesOrdenadas.push(...sucursalesDelUsuarioOrdenadas);
    this.sucursalesOrdenadas.push(...sucursalesDisponiblesOrdenadas);

    if (this.registroDeVisita !== undefined) {
      for (const suc of this.registroDeVisita.sucursalesProgramadas) {
        const temp = sucursalesDelUsuarioOrdenadas.filter((x) => x.id == suc.id);
        const index = this.sucursalesOrdenadas.indexOf(temp[0]);
        if (index !== -1) {
          this.sucursalesOrdenadas.splice(index, 1);
        }
        this.sucursalesSeleccionadas.push(suc);
      }
    } else if (this.sucursalesOrdenadas.length > 0) {
      this.sucursalesSeleccionadas.push(this.sucursalesOrdenadas[0]);
      this.sucursalesOrdenadas.shift();
    }

    const guardia: any = { id: '-999', nombre: 'GUARDIA' };
    if (this.registroDeGuardia !== undefined) {
      this.sucursalesSeleccionadas.unshift(guardia);
    } else {
      this.sucursalesOrdenadas.unshift(guardia);
    }

    this.emitirCambios();
  }

  ordenarSucursalesUser(sucursales: Sucursal[]): Sucursal[] {
    return sucursales.sort((a, b) => {
      if (this.ordenarxmantenimiento) {
        const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id) ?? Infinity;
        const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id) ?? Infinity;
        return mantenimientoA - mantenimientoB;
      } else {
        const ticketsA = this.obtenerTicketsPorSucursal(a.id).length;
        const ticketsB = this.obtenerTicketsPorSucursal(b.id).length;

        if (ticketsA === ticketsB) {
          const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id) ?? Infinity;
          const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id) ?? Infinity;
          return mantenimientoA - mantenimientoB;
        }

        return ticketsB - ticketsA;
      }
    });
  }

  obtenerTicketsPorSucursal(idSucursal: number | any): Ticket[] {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  obtenerPorcentajedeUltimoMantenimiento(idSucursal: string): number {
    let porcentaje = 0;
    const registro = this.ultimosMantenimientos.filter((x) => x.idSucursal == idSucursal);
    if (registro.length > 0 && this.usuarioActual) {
      const servicio = this.mantenimientoFactory.getService(this.usuarioActual.idArea);
      porcentaje = servicio.calcularPorcentaje(registro[0]);
    }
    return porcentaje;
  }

  onMovimientoPicklist(): void {
    this.emitirCambios();
  }

  private emitirCambios(): void {
    this.sucursalesOrdenadasChange.emit(this.sucursalesOrdenadas);
    this.sucursalesSeleccionadasChange.emit(this.sucursalesSeleccionadas);
    this.listasActualizadas.emit();
  }
}
