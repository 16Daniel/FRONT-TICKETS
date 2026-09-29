import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { AvatarModule } from 'ngx-avatars';
import { InputSwitchModule } from 'primeng/inputswitch';
import Swal from 'sweetalert2';

import { ResponsableTarea } from '../../../tareas/interfaces/responsable-tarea.interface';
import { TaskResponsibleService } from '../../../tareas/services/task-responsible.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { MailService, EnviarCorreoRequest } from '../../../shared/services/mail.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Usuario } from '../../interfaces/usuario.model';

@Component({
  selector: 'app-crear-responsable-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DialogModule, 
    DropdownModule, 
    AvatarModule, 
    InputSwitchModule
  ],
  templateUrl: './crear-responsable-dialog.component.html',
  styleUrl: './crear-responsable-dialog.component.scss'
})
export class CrearResponsableDialogComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() responsable: ResponsableTarea = new ResponsableTarea;
  @Input() esNuevo: boolean = true;
  
  responsablesService = inject(TaskResponsibleService);
  branchesService = inject(BranchesService);
  messageService = inject(MessageService);
  mailService = inject(MailService);
  cdr = inject(ChangeDetectorRef);

  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  usuario!: Usuario;
  cargando = false;

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    
    // Solo asignamos si es nuevo (aunque desde el padre ya se puede enviar seteado)
    if (this.esNuevo && this.usuario.sucursales?.length > 0) {
      this.responsable.idSucursal = this.usuario.sucursales[0].id;
      this.responsable.color = '#1e1e24';
    }

    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.sucursalesMap.clear();
        data.forEach(s => this.sucursalesMap.set(s.id!, s.nombre));
        this.cdr.detectChanges();
      }
    });
  }

  async enviar(form: NgForm) {
    if (form.invalid || this.cargando) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }

    this.cargando = true;
    try {
      if (this.esNuevo) {
        // Verificar correo duplicado sólo al crear, o validarlo globalmente
        const existe = await this.responsablesService.correoExiste(this.responsable.correo);
        if (existe) {
          await Swal.fire({
            icon: 'warning',
            title: 'Correo duplicado',
            text: 'Este correo ya está registrado.',
            confirmButtonColor: '#D3152A',
            customClass: { container: 'swal-topmost' }
          });
          return;
        }

        const nuevoPin = await this.responsablesService.generarPinUnico();
        this.responsable.pin = nuevoPin;

        this.enviarCorreo(this.responsable, nuevoPin);
        await this.responsablesService.create({ ...this.responsable });
        
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Responsable creado',
        });
      } else {
        // Modo Edición
        if (!this.responsable.id) return;

        // Verificar si se cambió el correo a uno existente
        const existe = await this.responsablesService.correoExiste(this.responsable.correo);
        const noEsMismoRegistro = this.responsablesService.responsables.find(r => r.correo === this.responsable.correo && r.id !== this.responsable.id);
        
        if (existe && noEsMismoRegistro) {
          await Swal.fire({
            icon: 'warning',
            title: 'Correo duplicado',
            text: 'Este correo ya está registrado.',
            confirmButtonColor: '#D3152A',
            customClass: { container: 'swal-topmost' }
          });
          return;
        }

        await this.responsablesService.update(this.responsable, this.responsable.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Correcto',
          detail: 'Responsable actualizado',
        });
      }

      this.closeEvent.emit(true);
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error al procesar el responsable',
      });
    } finally {
      this.cargando = false;
    }
  }

  enviarCorreo(responsable: ResponsableTarea, pin: string) {
    const request: EnviarCorreoRequest = {
      titulo: `Tu PIN ha sido generado`,
      body: this.generatePinEmailHtml(responsable.nombre, this.sucursalesMap.get(responsable.idSucursal)!, pin),
      destinatario: responsable.correo
    };

    this.mailService.enviarCorreo(request).subscribe({
      next: res => console.log('Correo enviado correctamente', res),
      error: err => console.error('Error al enviar correo', err)
    });
  }

  generatePinEmailHtml(nombre: string, sucursal: string, pin: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .pin-text { font-family: 'Courier New', Courier, monospace !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f6fa; color: #1e1e24;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">

        <tr>
          <td align="center" style="padding: 30px 20px; background-color: #D3152A;">
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
            <p style="font-size: 15px; color: #64748b; line-height: 1.5;">
              Este es tu código de acceso para el sistema de tickets en la sucursal: <br>
              <span style="color: #1e1e24; font-weight: bold;">${sucursal}</span>
            </p>

            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
              <tr>
                <td align="center" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 20px 35px;">
                  <span class="pin-text" style="font-size: 36px; font-weight: bold; color: #D3152A; letter-spacing: 12px;">
                    ${pin}
                  </span>
                </td>
              </tr>
            </table>

            <p style="font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.4; margin-bottom: 0;">
              Por razones de seguridad, no compartas este código con nadie. <br>
              Si tú no realizaste este cambio, informa a tu supervisor de inmediato.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  }

  onHide() {
    this.closeEvent.emit(false);
  }
}
