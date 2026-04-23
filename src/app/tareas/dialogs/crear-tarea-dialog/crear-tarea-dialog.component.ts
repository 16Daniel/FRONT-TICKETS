import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import Swal from 'sweetalert2';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { TareasService } from '../../services/tareas.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { Tarea } from '../../interfaces/tarea.interface';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';
import { EnviarCorreoRequest, MailService } from '../../../shared/services/mail.service';
import { MessageService } from 'primeng/api';
import { ChecksPrioridadEinsehowerComponent } from '../../components/checks-prioridad-eisenhower/checks-prioridad-eisenhower.component';
import { AvataresResponsablesTareaComponent } from "../../components/avatares-responsables-tarea/avatares-responsables-tarea.component";
import { ContenedorSubtareasComponent } from '../../components/contenedor-subtareas/contenedor-subtareas.component';
import { EstatusTarea } from '../../interfaces/estatus-tarea.interface';
import { EtiquetaTarea } from '../../interfaces/etiqueta-tarea.interface';
import { StatusTaskService } from '../../services/status-task.service';
import { LabelsTasksService } from '../../services/labels-tasks.service';
import { AreasService } from '../../../areas/services/areas.service';

@Component({
  selector: 'app-crear-tarea-dialog',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    CommonModule,
    DropdownModule,
    ChecksPrioridadEinsehowerComponent,
    MultiSelectModule,
    AvatarModule,
    TooltipModule,
    AvataresResponsablesTareaComponent,
    ContenedorSubtareasComponent
  ],
  templateUrl: './crear-tarea-dialog.component.html',
  styleUrl: './crear-tarea-dialog.component.scss'
})
export class CrearTareaDialogComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  private mailService = inject(MailService);
  private messageService = inject(MessageService);
  private statusTaskService = inject(StatusTaskService);
  private labelsTasksService = inject(LabelsTasksService);
  private areasService = inject(AreasService);

  estatusTeras: EstatusTarea[] = [];
  etiquetas: EtiquetaTarea[] = [];
  areasMap: Record<string, string> = {};
  mostrarSubtareas: boolean = false;

  imagenesEvidencia: string[] = [];
  imagenesBase64: string[] = [];
  archivos: File[] = [];

  usuario: Usuario;
  tarea: Tarea = new Tarea();
  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  responsables: ResponsableTarea[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private tareasService: TareasService,
    private firebaseStorage: FirebaseStorageService,
    private taskResponsibleService: TaskResponsibleService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.tarea.idSucursal = this.usuario.sucursales[0].id;
  }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.statusTaskService.estatus$.subscribe(estatus => this.estatusTeras = estatus);
    this.labelsTasksService.etiquetas$.subscribe(et => {
      this.etiquetas = et;
      this.etiquetas = this.labelsTasksService.filtrarPorSucursal(this.tarea.idSucursal);

    });
    this.areasService.areas$.subscribe(areas => {
      this.areasMap = {};
      areas.forEach(a => {
        this.areasMap[a.id] = a.nombre;
      });
    });
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      return;
    }

    if (!this.tarea.visibleGlobal && (!this.tarea.idsResponsables || this.tarea.idsResponsables.length === 0)) {
      Swal.fire({
        title: "ATENCIÓN",
        text: "No puedes crear una tarea privada sin responsables asignados.",
        icon: "warning",
        customClass: {
          container: 'swal-topmost'
        }
      });
      return;
    }

    this.firebaseStorage.cargarImagenesEvidenciasTareas(this.archivos)
      .then(async urls => {
        this.tarea.evidenciaUrls = urls;

        const cantidad = await this.getCantidadPorEstatus(this.tarea.idEstatus);
        this.tarea.orden = cantidad;

        await this.tareasService.create({ ...this.tarea });

        this.tarea.idsResponsables.forEach((idResponsable: string) => {
          const responasble = this.responsables.find(x => x.id == idResponsable);
          if (responasble?.correo)
            this.enviarCorreo(responasble);
        });

        Swal.fire({
          title: "OK",
          text: "TAREA CREADA!",
          icon: "success",
          customClass: {
            container: 'swal-topmost'
          }
        });
        this.closeEvent.emit();
      })
      .catch(async err => {
        console.error('Error al subir una o más imágenes:', err);
        Swal.fire({
          title: "ERROR",
          text: "ERROR AL SUBIR LAS IMÁGENES!",
          icon: "error",
          customClass: {
            container: 'swal-topmost'
          }
        });
        await this.tareasService.create({ ...this.tarea });
        Swal.fire("OK", "TAREA CREADA!", "success");
        // this.showMessage('success', 'Success', 'Enviado correctamente');
        this.closeEvent.emit();
      });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;

        this.sucursalesMap.clear();
        data.forEach(s =>
          this.sucursalesMap.set(s.id!, s.nombre)
        );

        this.actualizarResponsables();
        this.cdr.detectChanges();
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.archivos = Array.from(input.files);

    this.imagenesBase64 = [];

    this.archivos.forEach(file => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.imagenesBase64.push(reader.result);
          this.cdr.detectChanges();
        }
      };

      reader.readAsDataURL(file);
    });
  }

  onSeleccionarImagenes() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  calcularEisenhower() {
    const urgente = this.tarea.urgente;
    const importante = this.tarea.importante;

    if (!urgente || !importante) return;

    if (urgente === 'URGENTE' && importante === 'IMPORTANTE') {
      this.tarea.idEisenhower = '1';
    }
    else if (urgente === 'NO URGENTE' && importante === 'IMPORTANTE') {
      this.tarea.idEisenhower = '2';
    }
    else if (urgente === 'URGENTE' && importante === 'NO IMPORTANTE') {
      this.tarea.idEisenhower = '3';
    }
    else if (urgente === 'NO URGENTE' && importante === 'NO IMPORTANTE') {
      this.tarea.idEisenhower = '4';
    }
  }

  recibirPrioridad(event: any) {
    this.tarea.urgente = event.urgente;
    this.tarea.importante = event.importante;
    this.tarea.idEisenhower = event.idEisenhower;
  }

  agregarSubtarea(texto: string) {
    this.tarea.subtareas = this.tarea.subtareas || [];
    this.tarea.subtareas.push({
      titulo: texto,
      terminado: false
    });
  }

  async toggleSubtareas() {
    if (this.mostrarSubtareas && this.tarea.subtareas && this.tarea.subtareas.length > 0) {
      const result = await Swal.fire({
        title: '¿Eliminar subtareas?',
        text: 'Esta tarea tiene subtareas. ¿Deseas eliminarlas?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, conservar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        customClass: {
          container: 'swal-topmost'
        }
      });

      if (!result.isConfirmed) {
        this.mostrarSubtareas = false;
        return;
      }

      this.tarea.subtareas = [];
      this.mostrarSubtareas = false;
      return;
    }

    this.mostrarSubtareas = !this.mostrarSubtareas;

    if (!this.tarea.subtareas) {
      this.tarea.subtareas = [];
    }
  }

  getCantidadPorEstatus(idEstatus: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.tareasService.getByEstatus(idEstatus).subscribe({
        next: tareas => resolve(tareas.length),
        error: err => reject(err)
      });
    });
  }

  private actualizarResponsables(): void {
    this.responsables = this.taskResponsibleService.filtrarPorSucursal(this.tarea.idSucursal);
  }

  onSucursalesChange() {
    this.actualizarResponsables();
  }

  getResponsablesDeTarea(tarea: Tarea) {
    return this.responsables.filter(r =>
      tarea.idsResponsables?.includes(r.id!)
    );
  }

  private generarBodyCorreo(responsable: ResponsableTarea): string {
    return `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333; line-height: 1.4;">

      <h3 style="color: #2c3e50; margin-bottom: 8px;">
        📌 Nueva tarea asignada
      </h3>

      <p style="margin: 0 0 8px 0;">
        Hola <strong>${responsable.nombre}</strong>,
      </p>

      <p style="margin: 0 0 12px 0;">
        Se te ha asignado una nueva tarea:
      </p>

      <div style="padding: 10px 12px; background-color: #f8f9fa; border-radius: 6px;">

        <p style="margin: 4px 0;">
          <strong>Título:</strong> ${this.tarea.titulo}
        </p>

        <p style="margin: 4px 0;">
          <strong>Descripción:</strong> ${this.tarea.descripcion || 'Sin descripción'}
        </p>

        <p style="margin: 4px 0;">
          <strong>Sucursal:</strong> ${this.sucursales.find(x => x.id == this.tarea.idSucursal)?.nombre || 'N/A'}
        </p>

        <p style="margin: 4px 0;">
          <strong>Fecha creación:</strong>
          ${this.tarea.fecha ? new Date(this.tarea.fecha).toLocaleDateString() : 'N/A'}
        </p>

        ${this.tarea.deathline
        ? `
              <p style="margin: 4px 0; color: #c0392b;">
                <strong>Fecha límite:</strong>
                ${new Date(this.tarea.deathline).toLocaleDateString()}
              </p>
            `
        : ''
      }

      </div>

      <p style="margin-top: 14px;">
        Por favor ingresa al sistema para revisar la tarea y darle seguimiento.
      </p>

      <hr style="margin: 16px 0;" />

      <p style="font-size: 12px; color: #777; margin: 0;">
        Este correo fue generado automáticamente por el sistema de tickets.
      </p>

    </div>
  `;
  }

  enviarCorreo(responsable: ResponsableTarea) {

    const request: EnviarCorreoRequest = {
      titulo: `Nueva tarea asignada: ${this.tarea.titulo}`,
      body: this.generarBodyCorreo(responsable),
      destinatario: responsable.correo
    };

    this.mailService.enviarCorreo(request).subscribe({
      next: res => {
        this.showMessage('success', 'Success', 'Email enviado');
        console.log('Correo enviado correctamente', res);
      },
      error: err => {
        console.error('Error al enviar correo', err);
      }
    });
  }

  showMessage = (sev: string, summ: string, det: string) =>
    this.messageService.add({ severity: sev, summary: summ, detail: det });

  cambiarVisibilidad() {
    this.tarea.visibleGlobal = !this.tarea.visibleGlobal;
  }

  convertirAProyecto() {
    this.tarea.esProyecto = true;
  }

  convertirATarea() {
    this.tarea.esProyecto = false;
  }

  onSeleccionarLider(responsable: ResponsableTarea) {
    if (this.tarea.idResponsablePrincipal == responsable.id) {
      this.tarea.idResponsablePrincipal = null;
    }
    else {
      this.tarea.idResponsablePrincipal = responsable.id;
    }
  }

  getProgressColor(porcentaje: number) {
    if (porcentaje < 40) return 'bg-danger';
    if (porcentaje < 70) return 'bg-warning';
    return 'bg-success';
  }
}
