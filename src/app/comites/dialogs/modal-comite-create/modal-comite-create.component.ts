import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { AreasService } from '../../../areas/services/areas.service';
import { Comite } from '../../interfaces/comite';
import { ComitesService } from '../../services/comites.service';

@Component({
  selector: 'app-modal-comite-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, MultiSelectModule],
  templateUrl: './modal-comite-create.component.html',
  styleUrl: './modal-comite-create.component.scss',
})
export class ModalComiteCreateComponent implements OnInit {
  @Input() mostrarModalCrearComite = false;
  @Input() comite: Comite = new Comite();
  @Input() esNuevoComite = true;
  @Output() closeEvent = new EventEmitter<boolean>();

  idComiteEditar = '';
  guardando = false;

  constructor(
    private comitesService: ComitesService,
    public areasService: AreasService,
    private messageService: MessageService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.esNuevoComite) {
      this.comite = {
        ...this.comite,
        areas: [...(this.comite.areas ?? [])],
      };
      this.idComiteEditar = this.comite.id ?? '';
      return;
    }

    try {
      this.comite = {
        ...this.comite,
        id: await this.comitesService.obtenerSecuencial(),
        areas: this.comite.areas ?? [],
        eliminado: false,
      };
    } catch (error) {
      this.showMessage(
        'error',
        'Error',
        error instanceof Error ? error.message : 'No se pudo obtener el ID del comité.',
      );
    }
  }

  onHide(): void {
    this.closeEvent.emit(false);
  }

  async enviar(form: NgForm): Promise<void> {
    if (form.invalid || !this.comite.nombre.trim() || (this.esNuevoComite && !this.comite.id)) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      this.showMessage(
        'error',
        'Error',
        this.esNuevoComite && !this.comite.id
          ? 'No se pudo asignar el ID del comité.'
          : 'Campos requeridos incompletos',
      );
      return;
    }

    this.guardando = true;
    try {
      if (this.esNuevoComite) {
        await this.comitesService.create({
          ...this.comite,
          id: String(this.comite.id),
          nombre: this.comite.nombre.trim(),
          areas: [...(this.comite.areas ?? [])],
          eliminado: false,
        });
        this.showMessage('success', 'Éxito', 'Comité creado correctamente');
      } else {
        await this.comitesService.update(
          {
            nombre: this.comite.nombre.trim(),
            areas: [...(this.comite.areas ?? [])],
          },
          this.idComiteEditar,
        );
        this.showMessage('success', 'Éxito', 'Comité actualizado correctamente');
      }

      this.closeEvent.emit(false);
    } catch (error) {
      this.showMessage(
        'error',
        'Error',
        error instanceof Error ? error.message : 'No se pudo guardar el comité.',
      );
    } finally {
      this.guardando = false;
    }
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
