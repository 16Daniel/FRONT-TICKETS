import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { StatusTpvsDevicesService } from '../../../activos-fijos/services/status-tpvs-devices.service';
import { ModalColorEstatusDispositivoTpvComponent } from '../../../activos-fijos/dialogs/modal-color-estatus-dispositivo-tpv/modal-color-estatus-dispositivo-tpv.component';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Dispositivo } from '../../../activos-fijos/interfaces/dispositivo.interface';
import { EstatusTPV } from '../../../activos-fijos/interfaces/estatus-tpv.interface';
import { BranchesService } from '../../../sucursales/services/branches.service';

@Component({
  selector: 'app-tabla-tvs-bocinas',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule, ModalColorEstatusDispositivoTpvComponent],
  templateUrl: './tabla-tvs-bocinas.component.html',
  styleUrl: './tabla-tvs-bocinas.component.scss'
})
export class TablaTvsBocinasComponent implements OnInit {
  @Input() sucursal!: Sucursal;

  dispositivoSeleccionado!: Dispositivo;
  estatus: EstatusTPV[] = [];
  isLoading: boolean = true;
  mostrarModaalEstatus: boolean = false;
  tipo!: string;
  usuario!: Usuario;

  constructor(
    private estatusService: StatusTpvsDevicesService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService
  ) { }

  ngOnInit(): void {
    this.estatusService.estatus$.subscribe((estatus) => {
      this.estatus = estatus;
      this.isLoading = false;
      this.cdr.detectChanges();
    });

    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
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
          nuevoDispositivo.estatus = '1'; // Default status (e.g. active)

          if (tipo === 'TV') {
            if (!this.sucursal.tvs) this.sucursal.tvs = [];
            this.sucursal.tvs.push(nuevoDispositivo);
          } else {
            if (!this.sucursal.bocinas) this.sucursal.bocinas = [];
            this.sucursal.bocinas.push(nuevoDispositivo);
          }
          
          try {
            await this.branchesService.update(this.sucursal, this.sucursal.id);
          } catch (error) {
            console.error('Error actualizando sucursal', error);
          }
          
          this.cdr.detectChanges();
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
          if (tipo === 'TV' && this.sucursal.tvs) {
            this.sucursal.tvs = this.sucursal.tvs.filter(d => d.id !== dispositivo.id);
          } else if (tipo === 'BOCINA' && this.sucursal.bocinas) {
            this.sucursal.bocinas = this.sucursal.bocinas.filter(d => d.id !== dispositivo.id);
          }
          
          try {
            await this.branchesService.update(this.sucursal, this.sucursal.id);
          } catch (error) {
            console.error('Error actualizando sucursal', error);
          }
          
          this.cdr.detectChanges();
          Swal.fire('Eliminado!', 'El dispositivo ha sido eliminado.', 'success');
        }
      });
    });
  }
}
