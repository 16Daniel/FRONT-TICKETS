import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { Area, AreaNotificationSettings } from '../../interfaces/area.model';
import { GrupoWhatsapp } from '../../interfaces/grupo-whatsapp.interface';
import { AreaOrganigrama } from '../../../areas/interfaces/area-organigrama.model';
import { AreasService } from '../../../areas/services/areas.service';
import { WhatsappService } from '../../services/whatsapp.service';
import { OrganigramaEditorComponent } from '../../components/organigrama-editor/organigrama-editor.component';

@Component({
  selector: 'app-modal-area-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, TabViewModule, DropdownModule, OrganigramaEditorComponent],
  templateUrl: './modal-area-create.component.html',
  styleUrl: './modal-area-create.component.scss'
})

export class ModalAreaCreateComponent {

  @Input() mostrarModalCrearArea: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() area: Area | any;
  @Input() esNuevaArea: boolean = true;
  idAreaEditar: string = '';
  gruposWhatsapp: GrupoWhatsapp[] = [];
  cargandoGruposWhatsapp = false;
  errorGruposWhatsapp = '';
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
    private areasService: AreasService,
    private whatsappService: WhatsappService
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

    this.area.notificacionesTicket = {
      ticketCreado: false,
      ticketCerrado: false,
      superaTA: false,
      superaTR: false,
      ...(this.area.notificacionesTicket ?? {}),
    } satisfies AreaNotificationSettings;
    this.obtenerGruposWhatsapp();
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

  obtenerGruposWhatsapp(): void {
    this.cargandoGruposWhatsapp = true;
    this.errorGruposWhatsapp = '';
    this.whatsappService.obtenergrupos().subscribe({
      next: (respuesta: unknown) => {
        try {
          this.gruposWhatsapp = this.normalizarGruposWhatsapp(respuesta);
        } catch (error) {
          console.error('La API de WhatsApp devolvió una respuesta de grupos inválida:', error);
          this.errorGruposWhatsapp = 'No fue posible interpretar la lista de grupos de WhatsApp.';
        } finally {
          this.cargandoGruposWhatsapp = false;
        }
      },
      error: (error) => {
        console.error('Error al obtener los grupos de WhatsApp:', error);
        this.errorGruposWhatsapp = 'No fue posible cargar los grupos de WhatsApp.';
        this.cargandoGruposWhatsapp = false;
      }
    });
  }

  private normalizarGruposWhatsapp(respuesta: unknown): GrupoWhatsapp[] {
    let grupos: unknown = respuesta;

    if (!Array.isArray(grupos) && typeof grupos === 'object' && grupos !== null) {
      const resultado = grupos as Record<string, unknown>;
      grupos = resultado['groups'] ?? resultado['data'] ?? resultado['results'];
    }

    if (!Array.isArray(grupos)) {
      throw new TypeError('Se esperaba una lista de grupos de WhatsApp.');
    }

    return grupos.map((grupo: unknown, indice: number) => {
      if (typeof grupo !== 'object' || grupo === null) {
        throw new TypeError(`El grupo en la posición ${indice} no es válido.`);
      }

      const registro = grupo as Record<string, unknown>;
      const id = registro['id'];
      const name = registro['name'];
      if (typeof id !== 'string' || typeof name !== 'string') {
        throw new TypeError(`El grupo en la posición ${indice} no contiene id y name válidos.`);
      }

      return { id, name };
    });
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
      notificacionesTicket: { ...this.area.notificacionesTicket },
    };
    delete area.organigrama;
    return area;
  }
}
