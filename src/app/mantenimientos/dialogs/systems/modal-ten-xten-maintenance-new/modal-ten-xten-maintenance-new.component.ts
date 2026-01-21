import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

import { BranchesService } from '../../../../sucursales/services/branches.service';
import { Sucursal } from '../../../../sucursales/interfaces/sucursal.model';
import { Mantenimiento10x10 } from '../../../interfaces/mantenimiento-10x10.model';

@Component({
  selector: 'app-modal-ten-xten-maintenance-new',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './modal-ten-xten-maintenance-new.component.html',
})
export class ModalTenXtenMaintenanceNewComponent implements OnInit {
  @Input() mostrarModal10x10New: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  sucursales: Sucursal[] = [];

  constructor(
    private branchesService: BranchesService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  async nuevoMantenimiento() {
    const mantenimiento: Mantenimiento10x10 = {
      idSucursal: '1',
      idUsuarioSoporte: "JhPZN7fQD1REyldGXop17qR8Now1",
      fecha: new Date(),
      estatus: true,
      mantenimientoCaja: false,
      mantenimientoCCTV: false,
      mantenimientoConcentradorApps: false,
      mantenimientoContenidosSistemaCable: false,
      mantenimientoImpresoras: false,
      mantenimientoInternet: false,
      mantenimientoNoBrakes: false,
      mantenimientoPuntosVentaTabletas: false,
      mantenimientoRack: false,
      mantenimientoTiemposCocina: false,
      observaciones: '',
      comentarios: [],
      participantesChat: []
    };

    // await this.mantenimientoService.create(mantenimiento);
    // console.log('ok');
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
