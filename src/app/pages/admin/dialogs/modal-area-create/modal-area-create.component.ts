import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { Area } from '../../../../models/area.model';
import { AreasService } from '../../../../services/areas.service';

@Component({
  selector: 'app-modal-area-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './modal-area-create.component.html',
  styleUrl: './modal-area-create.component.scss'
})

export class ModalAreaCreateComponent {

  @Input() mostrarModalCrearArea: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() area: Area | any;
  @Input() esNuevaArea: boolean = true;
  idAreaEditar: string = '';

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private areasService: AreasService
  ) { }

  async ngOnInit() {
    if (!this.esNuevaArea) {
      this.idAreaEditar = this.area.id;
    }

    if (this.esNuevaArea) {
      this.area.id = await this.areasService.obtenerSecuencial();
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

    this.esNuevaArea ? this.crear() : this.actualizar();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async crear() {
    // this.area = { ...this.area, id: parseInt(this.area.id) }
    try {
      await this.areasService.create({ ...this.area });
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Guardado correctamente');

    } catch (error: any) {
      this.showMessage('error', 'Error', error.message);
    }
  }

  actualizar() {
    this.area = { ...this.area, id: parseInt(this.area.id) }
    this.areasService
      .update(this.area, this.idAreaEditar)
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
