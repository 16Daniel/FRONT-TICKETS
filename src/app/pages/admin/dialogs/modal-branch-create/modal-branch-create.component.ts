import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { Sucursal } from '../../../../models/sucursal.model';
import { BranchesService } from '../../../../services/branches.service';
import { Usuario } from '../../../../models/usuario.model';

@Component({
  selector: 'app-modal-branch-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './modal-branch-create.component.html',
  styleUrl: './modal-branch-create.component.scss'
})

export class ModalBranchCreateComponent implements OnInit {
  @Input() mostrarModalCrearSucursal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() sucursal: Sucursal | any;
  @Input() esNuevaSucursal: boolean = true;
  idSucursalEditar: string = '';
  usuario: Usuario;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  async ngOnInit() {
    if (!this.esNuevaSucursal) {
      this.idSucursalEditar = this.sucursal.id;
    }

    if (this.esNuevaSucursal) {
      this.sucursal.id = await this.branchesService.obtenerSecuencial();
      this.cdr.detectChanges();
    }
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    // console.log(this.sucursal)
    this.esNuevaSucursal ? this.crear() : this.actualizar();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async crear() {
    this.sucursal = { ...this.sucursal, id: parseInt(this.sucursal.id) }
    try {
      await this.branchesService.create({ ...this.sucursal });
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Guardado correctamente');

    } catch (error: any) {
      this.showMessage('error', 'Error', error.message);
    }
  }

  actualizar() {
    debugger
    this.sucursal = { ...this.sucursal, id: parseInt(this.sucursal.id) }
    this.branchesService
      .update(this.sucursal, this.idSucursalEditar)
      .then(() => {
        this.cdr.detectChanges();
        this.closeEvent.emit(false); // Cerrar modal
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  esMantenimientoActivo(sucursal: Sucursal): boolean {
    const activo = Array.isArray(sucursal.activoMantenimientos)
      ? sucursal.activoMantenimientos
      : [];

    return activo.includes(this.usuario.idArea);
  }

  toggleMantenimiento(sucursal: Sucursal): void {
    if (!Array.isArray(sucursal.activoMantenimientos)) {
      sucursal.activoMantenimientos = [];
    }

    const index = sucursal.activoMantenimientos.indexOf(this.usuario.idArea);

    if (index > -1) {
      sucursal.activoMantenimientos.splice(index, 1);
    } else {
      sucursal.activoMantenimientos.push(this.usuario.idArea);
    }
  }

}
