import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { Mantenimiento10x10 } from '../../../../models/mantenimiento-10x10.model';
import { Maintenance10x10Service } from '../../../../services/maintenance-10x10.service';
import { DialogModule } from 'primeng/dialog';
import { BranchesService } from '../../../../services/branches.service';
import { Sucursal } from '../../../../models/sucursal.model';

@Component({
  selector: 'app-modal-ten-xten-maintenance-new',
  standalone: true,
  imports: [
    DialogModule
  ],
  templateUrl: './modal-ten-xten-maintenance-new.component.html',
})
export class ModalTenXtenMaintenanceNewComponent implements OnInit {
@Input() mostrarModal10x10New:boolean = false; 
sucursales: Sucursal[] = [];
@Output() closeEvent = new EventEmitter<boolean>();
  ngOnInit(): void { 
    this.obtenerSucursales();
  }

    constructor(
      private mantenimientoService: Maintenance10x10Service,
      private branchesService: BranchesService,
      private cdr: ChangeDetectorRef,
    ) {

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
    };

    await this.mantenimientoService.create(mantenimiento);
    console.log('ok');
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
