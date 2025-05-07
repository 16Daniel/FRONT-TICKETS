import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';

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

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService
  ) { }

  ngOnInit(): void {
    if (!this.esNuevaSucursal) {
      this.idSucursalEditar = this.sucursal.id;
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
}
