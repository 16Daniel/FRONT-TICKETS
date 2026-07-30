import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';

import { StatusTpvsDevicesService } from '../../services/status-tpvs-devices.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { DispositivosSucursalesService } from '../../../sucursales/services/dispositivos-sucursales.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Dispositivo } from '../../interfaces/dispositivo.interface';
import { EstatusTPV } from '../../interfaces/estatus-tpv.interface';

@Component({
  selector: 'app-modal-color-estatus-dispositivo-tpv',
  standalone: true,
  imports: [DialogModule, DropdownModule, CommonModule, FormsModule, ButtonModule],
  templateUrl: './modal-color-estatus-dispositivo-tpv.component.html',
  styleUrl: './modal-color-estatus-dispositivo-tpv.component.scss'
})
export class ModalColorEstatusDispositivoTpvComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() sucursal!: Sucursal;
  @Input() dispositivo!: Dispositivo;
  @Input() tipo!: string; // TPV | TABLETA | TV | BOCINA
  @Output() closeEvent = new EventEmitter<boolean>();

  estatusTPVList: EstatusTPV[] = [];
  estatusSeleccionado?: EstatusTPV;

  constructor(
    private statusService: StatusTpvsDevicesService,
    private branchesServices: BranchesService,
    private dispositivosSucursalesService: DispositivosSucursalesService
  ) { }

  ngOnInit(): void {
    this.estatusTPVList = this.statusService.estatus;

    if (this.dispositivo?.estatus) {
      this.estatusSeleccionado = this.estatusTPVList.find(
        (e) => e.id === this.dispositivo.estatus
      );
    }
  }

  async guardarEstatus() {
    if (!this.estatusSeleccionado) {
      await Swal.fire({
        icon: 'warning',
        title: 'Falta seleccionar un estatus',
        text: 'Por favor seleccione un estatus antes de continuar.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#6c757d',
        customClass: {
          container: 'swal-topmost'
        }
      });
      return;
    }

    if (this.tipo === 'TV' || this.tipo === 'BOCINA') {
      const dispDoc = await this.dispositivosSucursalesService.getOnceBySucursalId(this.sucursal.id);
      if (dispDoc) {
        const list = this.tipo === 'TV' ? dispDoc.tvs : dispDoc.bocinas;
        const item = list?.find(d => d.id === this.dispositivo.id);
        if (item) {
          item.estatus = this.estatusSeleccionado.id;
        }
        this.dispositivo.estatus = this.estatusSeleccionado.id;
        await this.dispositivosSucursalesService.saveOrUpdate(dispDoc);
      }
    } else {
      let lista: Dispositivo[] | undefined;
      switch (this.tipo) {
        case 'TPV':
          lista = this.sucursal.tpvs;
          break;
        case 'TABLETA':
          lista = this.sucursal.tabletas;
          break;
      }

      const index = lista?.findIndex(d => d.id === this.dispositivo.id);

      if (index !== undefined && index >= 0 && lista) {
        lista[index].estatus = this.estatusSeleccionado.id;
      }

      await this.branchesServices.update(this.sucursal, this.sucursal.id);
    }

    this.closeEvent.emit(false);
  }

  onHide = () => this.closeEvent.emit();

}

