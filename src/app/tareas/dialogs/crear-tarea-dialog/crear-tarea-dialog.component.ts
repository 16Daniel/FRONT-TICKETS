import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import Swal from 'sweetalert2';

import { EisenhowerPriorityChecksComponent } from '../../components/eisenhower-priority-checks/eisenhower-priority-checks.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { TareasService } from '../../services/tareas.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { Tarea } from '../../interfaces/tarea.interface';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';
import { EnviarCorreoRequest, MailService } from '../../../shared/services/mail.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-crear-tarea-dialog',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule,
    CommonModule,
    DropdownModule,
    EisenhowerPriorityChecksComponent,
    MultiSelectModule,
    AvatarModule,
    TooltipModule
  ],
  templateUrl: './crear-tarea-dialog.component.html',
  styleUrl: './crear-tarea-dialog.component.scss'
})
export class CrearTareaDialogComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  mailService = inject(MailService);
  messageService = inject(MessageService);

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
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
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

}
