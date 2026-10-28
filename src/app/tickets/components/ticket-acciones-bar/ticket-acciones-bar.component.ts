import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { TicketsService } from '../../services/tickets.service';
import { TicketDetailHelperService } from '../../services/ticket-detail-helper.service';
import { SeleccionarUsuarioEspecialistaComponent } from '../../../usuarios/dialogs/seleccionar-usuario-especialista-dialog/seleccionar-usuario-especialista-dialog.component';
import { CategoriesService } from '../../../categorias/services/categories.service';
import { Categoria } from '../../../categorias/models/categoria.model';
import { Subcategoria } from '../../../categorias/interfaces/subcategoria.interface';
import { WhatsappService } from '../../../areas/services/whatsapp.service';
import { firstValueFrom, take } from 'rxjs';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-ticket-acciones-bar',
  standalone: true,
  imports: [CommonModule, SeleccionarUsuarioEspecialistaComponent],
  templateUrl: './ticket-acciones-bar.component.html',
  styleUrl: './ticket-acciones-bar.component.scss',
})
export class TicketAccionesBarComponent {
  @Input() ticket!: Ticket;
  @Input() usuario!: Usuario;

  mostrarModalEspecialistas = false;
  idSucursalEspecialista = '';

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private helper: TicketDetailHelperService,
    private categoriesService: CategoriesService,
    private whatsappService: WhatsappService
  ) {}

  get hasVisibleActions(): boolean {
    return (
      this.showBtnAsignar ||
      this.showBtnTrabajar ||
      this.showBtnValidar ||
      this.showBtnFinalizar ||
      this.showBtnRechazar ||
      this.showBtnValidacionAdmin
    );
  }

  get showBtnAsignar(): boolean {
    return (
      this.usuario?.idArea === '4' &&
      this.usuario?.idRol === '5' &&
      this.ticket?.idEstatusTicket === '2' &&
      !this.ticket?.esAsignadoEspecialista
    );
  }

  get showBtnTrabajar(): boolean {
    return (
      this.usuario?.idRol === '4' &&
      !!this.ticket?.idEstatusTicket &&
      ['1', '4', '6'].includes(this.ticket.idEstatusTicket)
    );
  }

  get showBtnValidar(): boolean {
    return this.usuario?.idRol === '4' && this.ticket?.idEstatusTicket === '2';
  }

  get showBtnFinalizar(): boolean {
    return this.usuario?.idRol === '2' && this.ticket?.idEstatusTicket === '7';
  }

  get showBtnRechazar(): boolean {
    return this.usuario?.idRol === '2' && this.ticket?.idEstatusTicket === '7';
  }

  get showBtnValidacionAdmin(): boolean {
    return (
      (this.usuario?.idRol === '1' || this.usuario?.idRol === '5') &&
      this.ticket?.idEstatusTicket === '3' &&
      !this.ticket?.validacionAdmin
    );
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  onClickTrabajarTicket(): void {
    if (!this.ticket) return;

    this.ticket.idEstatusTicket = '2';

    if (!this.ticket.fechaAtencion) {
      this.ticket.fechaAtencion = Timestamp.now();
    }

    this.ticketsService
      .update(this.ticket)
      .then(async () => {
        await this.helper.registrarBitacoraSistema(
          this.ticket.id!,
          `Ticket en atención (Trabajando)`
        );
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) => console.error(error));
  }

  async onClickPendienteValidarSucursal(): Promise<void> {
    if (!this.ticket) return;
    const rating = await this.helper.mostrarSwalCalificacion(
      'Validar Ticket',
      'El estado del ticket se cambiará a <b>POR VALIDAR</b>.',
      'Sí, enviar a validar'
    );
    if (!rating) return;

    this.ticket.idEstatusTicket = '7';
    this.ticket.idResponsable = this.usuario.id;
    this.ticket.calificacionAnalista = rating;

    this.ticketsService
      .update(this.ticket)
      .then(async () => {
        await this.helper.registrarBitacoraSistema(
          this.ticket.id!,
          `Ticket enviado a <b>VALIDAR</b> por el analista</b>`
        );
        this.showMessage('success', 'Éxito', 'Ticket enviado a validación correctamente');
      })
      .catch((error) => console.error(error));
  }

  async onClickValidacionAdmin(ticket: Ticket | any): Promise<void> {
    const confirmed = await this.helper.mostrarSwalConfirmacion(
      'Confirmación',
      'Validar ticket cerrado ¿Desea continuar?'
    );
    if (!confirmed) return;

    ticket.validacionAdmin = true;
    this.ticketsService
      .update(ticket)
      .then(async () => {
        await this.helper.registrarBitacoraSistema(
          ticket.id!,
          `Validación de administrador <b>confirmada</b>`
        );
        this.showMessage('success', 'Éxito', 'Validación correcta');
      })
      .catch((error) => console.error(error));
  }

  onClickAsignarEspecialista(): void {
    this.idSucursalEspecialista = this.ticket?.idSucursal;
    this.mostrarModalEspecialistas = true;
  }

  async onClickFinalizar(ticket: Ticket | any): Promise<void> {
    const rating = await this.helper.mostrarSwalCalificacion(
      'Finalizar Ticket',
      'El ticket se cerrará y cambiará a <b>FINALIZADO</b>.',
      'Sí, finalizar ticket'
    );
    if (!rating) return;

    ticket.idEstatusTicket = '3';
    ticket.calificacionSucursal = rating;
    ticket.fechaFin = Timestamp.now();

    this.ticketsService
      .update(ticket)
      .then(async () => {
        await this.enviarAvisoResolucionWhatsappSiCorresponde(ticket);
        await this.helper.registrarBitacoraSistema(
          ticket.id!,
          `Ticket <b>FINALIZADO</b> por la sucursal</b>`
        );
        this.showMessage('success', 'Éxito', 'Ticket finalizado correctamente');
      })
      .catch((error) => console.error(error));
  }

  private async enviarAvisoResolucionWhatsappSiCorresponde(ticket: Ticket): Promise<void> {
    try {
      const categorias = await firstValueFrom(
        this.categoriesService.get(String(ticket.idArea)).pipe(take(1))
      );
      const categoria = categorias.find(
        (item: Categoria) => String(item.id) === String(ticket.idCategoria)
      );
      const subcategoria = categoria && ticket.idSubcategoria
        ? this.buscarSubcategoria(categoria.subcategorias, String(ticket.idSubcategoria))
        : undefined;

      if (categoria?.alertaWhatsapp !== true && subcategoria?.alertaWhatsapp !== true) {
        return;
      }

      const nombreCategoria = ticket.nombreCategoria || categoria?.nombre || 'Sin categoría';
      const categoriaCompleta = ticket.nombreSubcategoria
        ? `${nombreCategoria} - ${ticket.nombreSubcategoria}`
        : nombreCategoria;
      const mensaje = [
        '✅ *TICKET DE URGENCIA RESUELTO*',
        `*Folio:* ${ticket.folio || 'Sin folio'}`,
        `*Categoría:* ${categoriaCompleta}`,
        `*Prioridad:* ${ticket.prioridad || 'Sin especificar'}`,
      ].join('\n');

      await this.whatsappService.enviarMensajeTexto(
        environment.grupoWAGerencias,
        mensaje
      );
    } catch (error) {
      console.error('Error al enviar el aviso de resolución por WhatsApp:', error);
      this.showMessage(
        'warn',
        'Error al enviar WhatsApp',
        'El ticket se finalizó, pero no fue posible enviar el aviso de resolución.'
      );
    }
  }

  private buscarSubcategoria(
    subcategorias: Subcategoria[] | undefined,
    idSubcategoria: string
  ): Subcategoria | undefined {
    for (const subcategoria of subcategorias || []) {
      if (String(subcategoria.id) === idSubcategoria) {
        return subcategoria;
      }
      const encontrada = this.buscarSubcategoria(subcategoria.subcategorias, idSubcategoria);
      if (encontrada) {
        return encontrada;
      }
    }
    return undefined;
  }

  async onClickRechazar(ticket: Ticket | any): Promise<void> {
    const confirmed = await this.helper.mostrarSwalConfirmacion(
      'Confirmación',
      'El estado del ticket se cambiará a "POR RESOLVER" ¿Desea continuar?'
    );
    if (!confirmed) return;

    ticket.idEstatusTicket = '1';
    this.ticketsService
      .update(ticket)
      .then(async () => {
        await this.helper.registrarBitacoraSistema(
          ticket.id!,
          `Soporte <b>RECHAZADO</b> por la sucursal. El ticket regresa a <b>POR RESOLVER</b>`
        );
        this.showMessage('success', 'Éxito', 'Enviado correctamente');
      })
      .catch((error) => console.error(error));
  }
}
