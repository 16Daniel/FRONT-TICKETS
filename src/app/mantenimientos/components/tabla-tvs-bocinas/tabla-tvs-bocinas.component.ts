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
      import('sweetalert2').then(SwalModule => {
        const Swal = SwalModule.default;
        
        const estatusOptions = this.estatus.map(e => 
          `<option value="${e.id}" ${dispositivo.estatus === e.id ? 'selected' : ''} style="background-color: ${e.color}; color: #000; font-weight: 600;">
            ${e.nombre}
          </option>`
        ).join('');

        Swal.fire({
          title: `Editar Dispositivo: ${dispositivo.nombre || ''}`,
          html: `
            <div style="text-align: left; font-size: 14px;">
              <label style="display:block; margin-bottom: 4px; font-weight: 600;">Nombre *</label>
              <input id="swal-input-nombre" class="swal2-input" value="${dispositivo.nombre || ''}" placeholder="Ej. TV Sala Principal" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
              
              <label style="display:block; margin-bottom: 4px; font-weight: 600;">Estatus</label>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span id="swal-color-indicator" style="display: inline-block; width: 24px; height: 24px; border-radius: 4px; border: 1px solid #ccc; background-color: ${this.getColorEstatus(dispositivo.estatus)}; flex-shrink: 0;"></span>
                <select id="swal-input-estatus" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;">
                  ${estatusOptions}
                </select>
              </div>

              <label style="display:block; margin-bottom: 4px; font-weight: 600;">Marca</label>
              <input id="swal-input-marca" class="swal2-input" value="${dispositivo.marca || ''}" placeholder="Ej. Samsung, LG" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
              
              <label style="display:block; margin-bottom: 4px; font-weight: 600;">Pulgadas</label>
              <input id="swal-input-pulgadas" class="swal2-input" value="${dispositivo.pulgadas || ''}" placeholder="Ej. 55&quot;" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
              
              <label style="display:block; margin-bottom: 4px; font-weight: 600;">Modelo</label>
              <input id="swal-input-modelo" class="swal2-input" value="${dispositivo.modelo || ''}" placeholder="Ej. UN55TU7000" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
              
              <label style="display:block; margin-bottom: 4px; font-weight: 600;">Número de Serie</label>
              <input id="swal-input-serie" class="swal2-input" value="${dispositivo.numeroSerie || ''}" placeholder="Ej. SN123456789" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
              
              <label style="display:block; margin-bottom: 4px; font-weight: 600;">Comentarios</label>
              <textarea id="swal-input-comentarios" class="swal2-textarea" placeholder="Comentarios adicionales" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box; height: 70px;">${dispositivo.comentarios || ''}</textarea>
            </div>
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          cancelButtonText: 'Cancelar',
          didOpen: () => {
            const select = document.getElementById('swal-input-estatus') as HTMLSelectElement;
            const indicator = document.getElementById('swal-color-indicator') as HTMLSpanElement;
            if (select && indicator) {
              select.addEventListener('change', () => {
                indicator.style.backgroundColor = this.getColorEstatus(select.value);
              });
            }
          },
          preConfirm: () => {
            const nombre = (document.getElementById('swal-input-nombre') as HTMLInputElement).value;
            const estatus = (document.getElementById('swal-input-estatus') as HTMLSelectElement).value;
            const marca = (document.getElementById('swal-input-marca') as HTMLInputElement).value;
            const pulgadas = (document.getElementById('swal-input-pulgadas') as HTMLInputElement).value;
            const modelo = (document.getElementById('swal-input-modelo') as HTMLInputElement).value;
            const numeroSerie = (document.getElementById('swal-input-serie') as HTMLInputElement).value;
            const comentarios = (document.getElementById('swal-input-comentarios') as HTMLTextAreaElement).value;

            if (!nombre) {
              Swal.showValidationMessage('¡Necesitas escribir un nombre!');
              return false;
            }

            return { nombre, estatus, marca, pulgadas, modelo, numeroSerie, comentarios };
          }
        }).then(async (result) => {
          if (result.isConfirmed && result.value) {
            dispositivo.nombre = result.value.nombre;
            dispositivo.estatus = result.value.estatus;
            dispositivo.marca = result.value.marca;
            dispositivo.pulgadas = result.value.pulgadas;
            dispositivo.modelo = result.value.modelo;
            dispositivo.numeroSerie = result.value.numeroSerie;
            dispositivo.comentarios = result.value.comentarios;

            try {
              await this.dispositivosSucursalesService.saveOrUpdate(this.dispositivosSucursal);
            } catch (error) {
              console.error('Error guardando en dispositivos-sucursal', error);
            }

            this.cdr.detectChanges();
            Swal.fire('Guardado!', 'El dispositivo ha sido actualizado.', 'success');
          }
        });
      });
    }
  }

  agregarDispositivo(tipo: 'TV' | 'BOCINA') {
    import('sweetalert2').then(SwalModule => {
      const Swal = SwalModule.default;
      Swal.fire({
        title: `Agregar ${tipo === 'TV' ? 'TV' : 'Bocina'}`,
        html: `
          <div style="text-align: left; font-size: 14px;">
            <label style="display:block; margin-bottom: 4px; font-weight: 600;">Nombre *</label>
            <input id="swal-input-nombre" class="swal2-input" placeholder="Ej. TV Sala Principal" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
            
            <label style="display:block; margin-bottom: 4px; font-weight: 600;">Marca</label>
            <input id="swal-input-marca" class="swal2-input" placeholder="Ej. Samsung, LG" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
            
            <label style="display:block; margin-bottom: 4px; font-weight: 600;">Pulgadas</label>
            <input id="swal-input-pulgadas" class="swal2-input" placeholder="Ej. 55&quot;" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
            
            <label style="display:block; margin-bottom: 4px; font-weight: 600;">Modelo</label>
            <input id="swal-input-modelo" class="swal2-input" placeholder="Ej. UN55TU7000" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
            
            <label style="display:block; margin-bottom: 4px; font-weight: 600;">Número de Serie</label>
            <input id="swal-input-serie" class="swal2-input" placeholder="Ej. SN123456789" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box;">
            
            <label style="display:block; margin-bottom: 4px; font-weight: 600;">Comentarios</label>
            <textarea id="swal-input-comentarios" class="swal2-textarea" placeholder="Comentarios adicionales" style="margin: 0 0 12px 0; width: 100%; box-sizing: border-box; height: 70px;"></textarea>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const nombre = (document.getElementById('swal-input-nombre') as HTMLInputElement).value;
          const marca = (document.getElementById('swal-input-marca') as HTMLInputElement).value;
          const pulgadas = (document.getElementById('swal-input-pulgadas') as HTMLInputElement).value;
          const modelo = (document.getElementById('swal-input-modelo') as HTMLInputElement).value;
          const numeroSerie = (document.getElementById('swal-input-serie') as HTMLInputElement).value;
          const comentarios = (document.getElementById('swal-input-comentarios') as HTMLTextAreaElement).value;

          if (!nombre) {
            Swal.showValidationMessage('¡Necesitas escribir un nombre!');
            return false;
          }

          return { nombre, marca, pulgadas, modelo, numeroSerie, comentarios };
        }
      }).then(async (result) => {
        if (result.isConfirmed && result.value) {
          const nuevoDispositivo = new Dispositivo();
          nuevoDispositivo.nombre = result.value.nombre;
          nuevoDispositivo.marca = result.value.marca;
          nuevoDispositivo.pulgadas = result.value.pulgadas;
          nuevoDispositivo.modelo = result.value.modelo;
          nuevoDispositivo.numeroSerie = result.value.numeroSerie;
          nuevoDispositivo.comentarios = result.value.comentarios;
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

