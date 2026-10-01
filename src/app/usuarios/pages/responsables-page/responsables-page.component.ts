import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AvatarModule } from 'ngx-avatars';
import { CrearResponsableDialogComponent } from '../../dialogs/crear-responsable-dialog/crear-responsable-dialog.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';

import { BranchesService } from '../../../sucursales/services/branches.service';
import { ResponsablesService } from '../../services/responsables.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Responsable } from '../../interfaces/responsable.interface';
import { Usuario } from '../../interfaces/usuario.model';
import { EnviarCorreoRequest, MailService } from '../../../shared/services/mail.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-responsables-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    ToastModule,
    AvatarModule,
    InputSwitchModule,
    TooltipModule,
    PageHeaderComponent,
    CrearResponsableDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './responsables-page.component.html',
  styleUrl: './responsables-page.component.scss'
})
export default class ResponsablesPageComponent implements OnInit, OnDestroy {

  branchesService = inject(BranchesService);
  responsablesService = inject(ResponsablesService);
  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);
  mailService = inject(MailService);

  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  responsables: Responsable[] = [];
  idSucursalSeleccionada: string | null = null;

  cargando = false;
  private subs = new Subscription();
  usuario!: Usuario;
  mostrarModalCrearResponsable = false;
  
  responsableSeleccionado: Responsable = new Responsable;
  esNuevoResponsable: boolean = true;

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursalSeleccionada = this.usuario.sucursales[0].id;

    this.subs.add(
      this.branchesService.get().subscribe({
        next: (data) => {
          this.sucursales = [
            { id: 'todos', nombre: 'TODAS LAS SUCURSALES' } as any,
            ...data
          ];

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

  abrirModalCrearResponsable() {
    this.esNuevoResponsable = true;
    this.responsableSeleccionado = new Responsable;
    this.responsableSeleccionado.idSucursal = this.idSucursalSeleccionada!;
    this.responsableSeleccionado.color = '#1e1e24';
    this.mostrarModalCrearResponsable = true;
  }

  abrirModalEditarResponsable(res: Responsable) {
    this.esNuevoResponsable = false;
    this.responsableSeleccionado = { ...res };
    this.mostrarModalCrearResponsable = true;
  }

  alCerrarModalCrear(recargar: boolean) {
    this.mostrarModalCrearResponsable = false;
  }

  onSucursalChange(id: string) {
    this.idSucursalSeleccionada = id;
    this.aplicarFiltro();
  }

  private aplicarFiltro() {
    if (this.idSucursalSeleccionada === 'todos') {
      this.verTodosResponsables();
    } else {
      this.responsables =
        this.responsablesService.filtrarPorSucursal(this.idSucursalSeleccionada, false);
    }
  }

  async eliminar(res: Responsable) {
    if (!res.id) return;

    const result = await Swal.fire({
      title: '¿Eliminar responsable?',
      text: `El responsable "${res.nombre}" será movido a eliminados`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d3152a',
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

    await this.responsablesService.update(res, res.id);
    this.showMessage('success', 'Actualizado', 'PIN regenerado');
    this.enviarCorreo(res, nuevoPin);
  }

  enviarCorreo(responsable: Responsable, pin: string) {
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

  verTodosResponsables() {
    this.idSucursalSeleccionada = 'todos';
    this.responsables = this.responsablesService.responsables;
  }
}
