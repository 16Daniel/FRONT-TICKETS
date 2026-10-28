import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { Area } from '../../interfaces/area.model';
import { EscalationLevel } from '../../interfaces/escalation-level.interface';
import { AreaOrganigrama } from '../../../areas/interfaces/area-organigrama.model';
import { AreasService } from '../../../areas/services/areas.service';
import { EscalationManagerComponent } from '../../components/escalation-manager.component/escalation-manager.component';
import { OrganigramaEditorComponent } from '../../components/organigrama-editor/organigrama-editor.component';

@Component({
  selector: 'app-modal-area-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, TabViewModule, EscalationManagerComponent, OrganigramaEditorComponent],
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
  grupoNuevosTickets = signal<string>('');
  organigrama: AreaOrganigrama = {
    areaId: '',
    raiz: {
      key: '',
      id: 1,
      nombre: 'Dirección',
      personaId: '',
      nombreResponsable: '',
      children: [],
    },
  };
  organigramaListo = false;
  organigramaValido = false;

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

    if(this.area.gruponotificacion){
      this.grupoNuevosTickets.set(this.area.gruponotificacion);
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

  actualizarOrganigrama(organigrama: AreaOrganigrama): void {
    this.organigrama = organigrama;
  }

  actualizarValidezOrganigrama(valido: boolean): void {
    this.organigramaValido = valido;
  }

  actualizarEstadoCargaOrganigrama(listo: boolean): void {
    this.organigramaListo = listo;
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

    if (!this.organigramaListo) {
      this.showMessage('error', 'Error', 'Espera a que cargue el organigrama antes de guardar.');
      return;
    }

    if (!this.organigramaValido) {
      this.showMessage('error', 'Error', 'Asigna al menos un responsable en cada nivel del organigrama.');
      return;
    }

    if (this.esNuevaArea) {
      await this.crear();
    } else {
      await this.actualizar();
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async crear() {
    this.area = { ...this.area, id: String(this.area.id) };
    const areaParaGuardar = this.prepararAreaParaGuardar();
    try {
      await this.areasService.create(areaParaGuardar, {
        ...this.organigrama,
        areaId: String(this.area.id),
      });
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Guardado correctamente');

    } catch (error: any) {
      this.showMessage('error', 'Error', error.message);
    }
  }

  async actualizar() {
    this.area = { ...this.area, id: String(this.area.id) };
    const areaParaGuardar = this.prepararAreaParaGuardar();
    try {
      await this.areasService.update(areaParaGuardar, this.idAreaEditar, {
        ...this.organigrama,
        areaId: this.idAreaEditar,
      });
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Enviado correctamente');
    } catch (error) {
      this.showMessage(
        'error',
        'Error',
        error instanceof Error ? error.message : 'No se pudo actualizar el área.'
      );
    }
  }

  private prepararAreaParaGuardar(): Area {
    const area: Area = {
      ...this.area,
      nivelesNotificacion: this.parentLevels(),
      gruponotificacion: this.grupoNuevosTickets(),
    };
    delete area.organigrama;
    return area;
  }
}
