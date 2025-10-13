import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';

import { EstatusTPV } from '../../models/estatus-tpv';
import { StatusTpvsDevicesService } from '../../services/status-tpvs-devices.service';
import { DispositivoTPV } from '../../models/dispositivo-tpv';
import { Sucursal } from '../../models/sucursal.model';
import { BranchesService } from '../../services/branches.service';

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
  @Input() dispositivo!: DispositivoTPV;
  @Input() tipo!: string; // TPV | TABLETA
  @Output() closeEvent = new EventEmitter<boolean>();

  estatusTPVList: EstatusTPV[] = [];
  estatusSeleccionado?: EstatusTPV;

  constructor(
    private statusService: StatusTpvsDevicesService,
    private branchesServices: BranchesService
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

    const index = this.tipo == 'TPV' ? this.sucursal.tpvs?.findIndex(d => d.id === this.dispositivo.id) :
      this.sucursal.tabletas?.findIndex(d => d.id === this.dispositivo.id);

    if (index !== undefined && index >= 0 && this.sucursal.tpvs) {
      this.tipo == 'TPV' ? this.sucursal.tpvs[index].estatus = this.estatusSeleccionado.id :
        this.sucursal.tabletas![index].estatus = this.estatusSeleccionado.id
    }

    this.branchesServices.update(this.sucursal, this.sucursal.id);

    console.log(this.estatusSeleccionado);
    console.log(this.sucursal);
    this.closeEvent.emit(false);
  }

  onHide = () => this.closeEvent.emit();

}
