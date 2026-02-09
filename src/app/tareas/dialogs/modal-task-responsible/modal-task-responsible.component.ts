import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AvatarModule } from 'ngx-avatars';
import { InputSwitchModule } from 'primeng/inputswitch';

import { BranchesService } from '../../../sucursales/services/branches.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { EnviarCorreoRequest, MailService } from '../../../shared/services/mail.service';

@Component({
  selector: 'app-modal-task-responsible',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    ToastModule,
    AvatarModule,
    InputSwitchModule
  ],
  providers: [MessageService],
  templateUrl: './modal-task-responsible.component.html',
  styleUrl: './modal-task-responsible.component.scss'
})
export class ModalTaskResponsibleComponent implements OnInit, OnDestroy {

  @Input() mostrarModal = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  branchesService = inject(BranchesService);
  responsablesService = inject(TaskResponsibleService);
  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);
  mailService = inject(MailService);

  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  responsables: ResponsableTarea[] = [];
  idSucursalSeleccionada: string | null = null;

  cargando = false;
  private subs = new Subscription();
  nuevoResponsable: ResponsableTarea = new ResponsableTarea;
  usuario!: Usuario;

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursalSeleccionada = this.usuario.sucursales[0].id;
    this.nuevoResponsable.idSucursal = this.usuario.sucursales[0].id;
    this.aplicarFiltro();

    this.subs.add(
      this.branchesService.get().subscribe({
        next: (data) => {
          this.sucursales = data;

          this.sucursalesMap.clear();
          data.forEach(s =>
            this.sucursalesMap.set(s.id!, s.nombre)
          );

          this.cdr.detectChanges();
        }
      })
    );

    this.subs.add(
      this.responsablesService.responsables$.subscribe(r => {
        this.responsables = r;
        this.aplicarFiltro();
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.invalid || this.cargando) return;

    this.cargando = true;
    try {
      await this.responsablesService.create({ ...this.nuevoResponsable });
      this.messageService.add({
        severity: 'success',
        summary: 'Correcto',
        detail: 'Responsable creado'
      });

      form.resetForm();
      this.nuevoResponsable.idSucursal = this.idSucursalSeleccionada!;

    } finally {
      this.cargando = false;
    }
  }

  onSucursalChange(id: string) {
    this.idSucursalSeleccionada = id;
    this.aplicarFiltro();
  }

  private aplicarFiltro() {
    this.responsables =
      this.responsablesService.filtrarPorSucursal(this.idSucursalSeleccionada);
  }

  activarEdicion(res: any) {
    res.editando = true;
  }

  async guardarCambios(res: any) {
    res.editando = false;
    if (!res.id) return;

    await this.responsablesService.update(res, res.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Cambios guardados'
    });
  }


  async eliminar(res: ResponsableTarea) {
    if (!res.id) return;

    const result = await Swal.fire({
      title: '¿Eliminar responsable?',
      text: `El responsable "${res.nombre}" será movido a eliminados`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      customClass: {
        container: 'swal-topmost'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await this.responsablesService.delete(res.id);

      Swal.fire({
        icon: 'success',
        title: 'Responsable eliminado',
        text: `"${res.nombre}" fue eliminado correctamente`,
        timer: 1400,
        showConfirmButton: false,
        customClass: {
          container: 'swal-topmost'
        }
      });

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el responsable. Intenta nuevamente.'
      });
    }
  }

  async regenerarPin(res: any) {
    const nuevoPin = await this.responsablesService.generarPinUnico();
    res.pin = nuevoPin;

    this.guardarCambios(res);
    this.enviarCorreo(res, nuevoPin);
  }

  enviarCorreo(responsable: ResponsableTarea, pin: string) {

    const request: EnviarCorreoRequest = {
      titulo: `Tu PIN ha sido generado`,
      body: this.generatePinEmailHtml(responsable.nombre, this.sucursalesMap.get(responsable.idSucursal)!, pin),
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

  /**
   * Genera el HTML para el envío de PIN por correo.
   * Diseño optimizado para máxima compatibilidad en clientes de correo.
   */
  generatePinEmailHtml(nombre: string, sucursal: string, pin: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        /* Estilos básicos para clientes que soportan bloques de estilo */
        .pin-text { font-family: 'Courier New', Courier, monospace !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333333;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; margin: 40px auto; background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px;">

        <tr>
          <td align="center" style="padding: 30px 20px; background-color: #ff5500; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; color: #ffffff; font-size: 22px; text-transform: uppercase; letter-spacing: 2px;">
              Seguridad de Acceso
            </h2>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
              Hola <strong>${nombre}</strong>,
            </p>
            <p style="font-size: 15px; color: #666666; line-height: 1.5;">
              Este es tu código de acceso para el sistema de tickets en la sucursal: <br>
              <span style="color: #333333; font-weight: bold;">${sucursal}</span>
            </p>

            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
              <tr>
                <td align="center" style="background-color: #f1f5f9; border-radius: 6px; padding: 20px 35px;">
                  <span class="pin-text" style="font-size: 36px; font-weight: bold; color: #ff5500; letter-spacing: 12px;">
                    ${pin}
                  </span>
                </td>
              </tr>
            </table>

            <p style="font-size: 13px; color: #999999; text-align: center; line-height: 1.4; margin-bottom: 0;">
              Por razones de seguridad, no compartas este código con nadie. <br>
              Si tú no realizaste este cambio, informa a tu supervisor de inmediato.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 0 30px 30px 30px;">
            <div style="border-top: 1px solid #eeeeee;"></div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

}
