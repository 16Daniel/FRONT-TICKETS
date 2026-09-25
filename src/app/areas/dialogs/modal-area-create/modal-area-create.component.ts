import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { Area, EscalationLevel } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { EscalationManagerComponent } from '../../components/escalation-manager.component/escalation-manager.component';

@Component({
  selector: 'app-modal-area-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, TabViewModule, EscalationManagerComponent],
  templateUrl: './modal-area-create.component.html',
  styleUrl: './modal-area-create.component.scss'
})

export class ModalAreaCreateComponent {

  @Input() mostrarModalCrearArea: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() area: Area | any;
  @Input() esNuevaArea: boolean = true;
  idAreaEditar: string = '';
  parentLevels = signal<EscalationLevel[]>([]);

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private areasService: AreasService
  ) { }

  async ngOnInit(): Promise<void> {
    if (!this.esNuevaArea) {
      this.idAreaEditar = this.area.id;
    }
    
    if (this.esNuevaArea) {
      this.area.id = await this.areasService.obtenerSecuencial();
      this.area = {
      ...this.area,
      horarioTrabajo: this.crearHorarioPorDia(),
      horarioGuardia: this.crearHorarioPorDia()
    };
      this.cdr.detectChanges();
    } 

    if(!this.area.horarioTrabajo) {
      this.area.horarioTrabajo = this.crearHorarioPorDia();
    }
    if(!this.area.horarioGuardia) {
      this.area.horarioGuardia = this.crearHorarioPorDia();
    }
    if(this.area.nivelesNotificacion){
      this.parentLevels.set(this.area.nivelesNotificacion);
    }

  }

  diasSemana = [
    { key: 'lunes', label: 'LUNES' },
    { key: 'martes', label: 'MARTES' },
    { key: 'miercoles', label: 'MIÉRCOLES' },
    { key: 'jueves', label: 'JUEVES' },
    { key: 'viernes', label: 'VIERNES' },
    { key: 'sabado', label: 'SÁBADO' },
    { key: 'domingo', label: 'DOMINGO' }
  ];

  crearHorarioPorDia() {
    return {
      lunes: { inicio: '', fin: '' },
      martes: { inicio: '', fin: '' },
      miercoles: { inicio: '', fin: '' },
      jueves: { inicio: '', fin: '' },
      viernes: { inicio: '', fin: '' },
      sabado: { inicio: '', fin: '' },
      domingo: { inicio: '', fin: '' }
    };
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
    this.area = { ...this.area, id: String(this.area.id) }
    this.area.nivelesNotificacion = this.parentLevels();
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
    this.area = { ...this.area, id: String(this.area.id) }
    this.area.nivelesNotificacion = this.parentLevels();
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
