import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { StatusTpvsDevicesService } from '../../../activos-fijos/services/status-tpvs-devices.service';
import { ModalColorEstatusDispositivoTpvComponent } from '../../../activos-fijos/dialogs/modal-color-estatus-dispositivo-tpv/modal-color-estatus-dispositivo-tpv.component';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Dispositivo } from '../../../activos-fijos/interfaces/dispositivo.interface';
import { EstatusTPV } from '../../../activos-fijos/interfaces/estatus-tpv.interface';
import { DispositivosSucursalesService } from '../../../sucursales/services/dispositivos-sucursales.service';
import { DispositivosSucursal } from '../../../sucursales/interfaces/dispositivos-sucursal.interface';

@Component({
  selector: 'app-tabla-tvs-bocinas',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule, ModalColorEstatusDispositivoTpvComponent],
  templateUrl: './tabla-tvs-bocinas.component.html',
  styleUrl: './tabla-tvs-bocinas.component.scss'
})
export class TablaTvsBocinasComponent implements OnInit, OnChanges {
  @Input() sucursal!: Sucursal;

  dispositivosSucursal: DispositivosSucursal = {
    idSucursal: '',
    tvs: [],
    bocinas: []
  };

  dispositivoSeleccionado!: Dispositivo;
  estatus: EstatusTPV[] = [];
  isLoading: boolean = true;
  mostrarModaalEstatus: boolean = false;
  tipo!: string;
  usuario!: Usuario;

  private dispositivosSub?: Subscription;

  constructor(
    private estatusService: StatusTpvsDevicesService,
    private cdr: ChangeDetectorRef,
    private dispositivosSucursalesService: DispositivosSucursalesService
  ) { }

  ngOnInit(): void {
    this.estatusService.estatus$.subscribe((estatus) => {
      this.estatus = estatus;
      this.isLoading = false;
      this.cdr.detectChanges();
    });

    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.cargarDispositivos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursal'] && !changes['sucursal'].firstChange) {
      this.cargarDispositivos();
    }
  }

  cargarDispositivos(): void {
    if (!this.sucursal || !this.sucursal.id) return;

    if (this.dispositivosSub) {
      this.dispositivosSub.unsubscribe();
    }

    const idSucursal = this.sucursal.id;
    this.dispositivosSub = this.dispositivosSucursalesService.getBySucursalId(idSucursal).subscribe((data) => {
      if (data && data.length > 0) {
        this.dispositivosSucursal = data[0];
      } else {
        this.dispositivosSucursal = {
          idSucursal: idSucursal,
          tvs: [],
          bocinas: []
        };
      }
      this.cdr.detectChanges();
    });
  }

  getColorEstatus(idEstatus: string): string {
    const estatus = this.estatus.find((e) => e.id === idEstatus);
    return estatus ? estatus.color : '#ffffff';
  }

  getNombreEstatus(idEstatus: string): string {
    const estatus = this.estatus.find((e) => e.id === idEstatus);
    return estatus ? estatus.nombre : '...';
  }

  verDetallesDispositivo(dispositivo: Dispositivo, tipo: string): void {
    if (this.usuario.idRol == '1' || this.usuario.idRol == '5' || this.usuario.idRol == '4') {
      this.mostrarModaalEstatus = true;
      this.dispositivoSeleccionado = dispositivo;
      this.tipo = tipo;
    }
  }

  agregarDispositivo(tipo: 'TV' | 'BOCINA') {
    import('sweetalert2').then(SwalModule => {
      const Swal = SwalModule.default;
      Swal.fire({
        title: `Agregar ${tipo === 'TV' ? 'TV' : 'Bocina'}`,
        input: 'text',
        inputLabel: 'Nombre del dispositivo o número de serie',
        inputPlaceholder: 'Ej. TV Sala Principal',
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return '¡Necesitas escribir un nombre!';
          }
          return null;
        }
      }).then(async (result) => {
        if (result.isConfirmed && result.value) {
          const nuevoDispositivo = new Dispositivo();
          nuevoDispositivo.nombre = result.value;
          nuevoDispositivo.estatus = '1';

          if (!this.dispositivosSucursal.tvs) this.dispositivosSucursal.tvs = [];
          if (!this.dispositivosSucursal.bocinas) this.dispositivosSucursal.bocinas = [];

          if (tipo === 'TV') {
            this.dispositivosSucursal.tvs.push({ ...nuevoDispositivo });
          } else {
            this.dispositivosSucursal.bocinas.push({ ...nuevoDispositivo });
          }

          try {
            await this.dispositivosSucursalesService.saveOrUpdate(this.dispositivosSucursal);
          } catch (error) {
            console.error('Error guardando en dispositivos-sucursal', error);
          }

          this.cdr.detectChanges();
          Swal.fire('Registrado!', 'El dispositivo ha sido registrado.', 'success');
        }
      });
    });
  }

  eliminarDispositivo(dispositivo: Dispositivo, tipo: 'TV' | 'BOCINA', event: Event) {
    event.stopPropagation();
    import('sweetalert2').then(SwalModule => {
      const Swal = SwalModule.default;
      Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará el dispositivo: ${dispositivo.nombre}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          if (tipo === 'TV' && this.dispositivosSucursal.tvs) {
            this.dispositivosSucursal.tvs = this.dispositivosSucursal.tvs.filter(d => d.id !== dispositivo.id);
          } else if (tipo === 'BOCINA' && this.dispositivosSucursal.bocinas) {
            this.dispositivosSucursal.bocinas = this.dispositivosSucursal.bocinas.filter(d => d.id !== dispositivo.id);
          }

          try {
            await this.dispositivosSucursalesService.saveOrUpdate(this.dispositivosSucursal);
          } catch (error) {
            console.error('Error actualizando dispositivos-sucursal', error);
          }

          this.cdr.detectChanges();
          Swal.fire('Eliminado!', 'El dispositivo ha sido eliminado.', 'success');
        }
      });
    });
  }

  onEstatusGuardado(event: any): void {
    this.dispositivosSucursalesService.saveOrUpdate(this.dispositivosSucursal);
  }
}

