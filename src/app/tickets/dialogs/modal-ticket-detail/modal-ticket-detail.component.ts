import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { Timestamp } from '@angular/fire/firestore';
import { DropdownModule } from 'primeng/dropdown';

import { ModalVisorImagenesComponent } from '../../../shared/dialogs/modal-visor-imagenes/modal-visor-imagenes.component';
import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { TicketsService } from '../../services/tickets.service';
import { SeleccionarUsuarioEspecialistaComponent } from '../../../usuarios/dialogs/seleccionar-usuario-especialista-dialog/seleccionar-usuario-especialista-dialog.component';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { AreasService } from '../../../areas/services/areas.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { CategoriesService } from '../../services/categories.service';
import { StatusTicketService } from '../../services/status-ticket.service';
import { EstatusTicket } from '../../interfaces/estatus-ticket.model';
import { TicketSlaGaugeComponent } from '../../components/ticket-sla-gauge/ticket-sla-gauge.component';
import { MiniMatrizUrgenciaComponent } from '../../components/mini-matriz-urgencia/mini-matriz-urgencia.component';
import { SupportTypesService } from '../../services/support-types.service';
import { TipoSoporte } from '../../interfaces/tipo-soporte.model';
import { UsersService } from '../../../usuarios/services/users.service';
import { AvatarModule } from 'ngx-avatars';
import { TabViewModule } from 'primeng/tabview';
import { BitacoraComponent } from '../../../shared/components/bitacora/bitacora.component';
import { ResponsablesService } from '../../../usuarios/services/responsables.service';
import { FileUtils } from '../../../shared/utils/file.utils';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { Bitacora } from '../../../shared/interfaces/bitacora.model';
import { BitacoraService } from '../../../shared/services/bitacora.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    AccordionModule,
    SeleccionarUsuarioEspecialistaComponent,
    CardModule,
    TooltipModule,
    ModalVisorImagenesComponent,
    TicketSlaGaugeComponent,
    MiniMatrizUrgenciaComponent,
    AvatarModule,
    TabViewModule,
    BitacoraComponent,
    RatingStarsComponent,
    DropdownModule
  ],
  providers: [],
  templateUrl: './modal-ticket-detail.component.html',
  styleUrl: './modal-ticket-detail.component.scss',
})
export class ModalTicketDetailComponent implements OnInit, OnDestroy {
  @Input() ticket: Ticket | undefined;
  @Input() showModalTicketDetail: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  public fileUtils = FileUtils;

  usuario: Usuario;
  mostrarModalEspecialistas: boolean = false;
  mostrarModalImagen: boolean = false;


  idSucursalEspecialista: string = '';
  urlVisorImagen: string = '';
  sucursales: any[] = [];
  categorias: any[] = [];
  estatusTickets: EstatusTicket[] = [];
  tiposSoporte: TipoSoporte[] = [];

  historial: Bitacora[] = [];
  historialSub?: Subscription;

  ultimaMitigacion: Bitacora | null = null;
  mitigacionSub?: Subscription;
  estatusAnterior?: string;

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    public datesHelper: DatesHelperService,
    private areasService: AreasService,
    private branchesService: BranchesService,
    private categoriesService: CategoriesService,
    private statusTicketService: StatusTicketService,
    private usersService: UsersService,
    public responsablesService: ResponsablesService,
    private bitacoraService: BitacoraService,
    private cdr: ChangeDetectorRef,
    private supportTypesService: SupportTypesService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  getResponsable(): Usuario | undefined {
    if (!this.ticket?.idResponsable) return undefined;
    return this.usersService.usuarios.find(u => u.id === this.ticket!.idResponsable);
  }

  getInvolucrados(): Usuario[] {
    if (!this.ticket?.idInvolucrados || !this.ticket.idInvolucrados.length) return [];
    return this.usersService.usuarios.filter(u => this.ticket!.idInvolucrados.includes(u.id!));
  }

  ngOnInit(): void {
    this.sucursales = (this.branchesService as any).sucursales || [];
    if (!this.sucursales || this.sucursales.length === 0) {
      this.branchesService.get().subscribe({
        next: (data) => (this.sucursales = data),
        error: () => { }
      });
    }

    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));
      },
      error: () => { }
    });

    this.statusTicketService.get().subscribe({
      next: (data) => {
        this.estatusTickets = data;
      },
      error: () => { }
    });

    this.supportTypesService.get().subscribe({
      next: (data) => {
        this.tiposSoporte = data;
      },
      error: () => { }
    });

    if (this.ticket?.id) {
      this.estatusAnterior = this.ticket.idEstatusTicket;

      this.historialSub = this.bitacoraService.getBitacoras('TICKETS', this.ticket.id, 'SISTEMA')
        .subscribe(data => {
          this.historial = data ? data.slice().reverse() : [];
          this.cdr.detectChanges();
        });

      this.mitigacionSub = this.bitacoraService.getBitacoras('TICKETS', this.ticket.id, 'MITIGACION')
        .subscribe(data => {
          if (data && data.length > 0) {
            this.ultimaMitigacion = data[data.length - 1];
          } else {
            this.ultimaMitigacion = null;
          }
          this.cdr.detectChanges();
        });
    }
  }

  ngOnDestroy(): void {
    this.historialSub?.unsubscribe();
    this.mitigacionSub?.unsubscribe();
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  get estatusTicketsOpciones(): any[] {
    return this.estatusTickets.map(s => {
      const id = String(s.id);
      return {
        ...s,
        disabled: id === '3' || id === '7'
      };
    });
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  actualizarEstatus(idEstatusTicket: string) {
    if (!this.ticket) return;

    if (String(idEstatusTicket) === '8') {
      this.mostrarSwalMitigacion(idEstatusTicket);
      return;
    }

    this.ticketsService
      .update(this.ticket)
      .then(async () => {
        this.estatusAnterior = idEstatusTicket;
        const estatus = this.estatusTickets.find(x => String(x.id) === String(idEstatusTicket));
        await this.registrarBitacoraSistema(`Estatus actualizado a: <b>${estatus?.nombre || 'Desconocido'}</b>`);
        this.showMessage('success', 'Éxito', 'Estatus actualizado correctamente');
      })
      .catch((error) => {
        console.error(error);
        if (this.estatusAnterior) this.ticket!.idEstatusTicket = this.estatusAnterior;
      });
  }

  actualizarTipoSoporte(idTipoSoporte: string) {
    if (!this.ticket) return;
    this.ticketsService
      .update(this.ticket)
      .then(async () => {
        const ts = this.tiposSoporte.find(x => String(x.id) === String(idTipoSoporte));
        await this.registrarBitacoraSistema(`Tipo de asistencia actualizado a: <b>${ts?.name || 'Desconocido'}</b>`);
        this.showMessage('success', 'Éxito', 'Asistencia actualizada correctamente');
      })
      .catch((error) => console.error(error));
  }

  obtenerNombreTipoSoporte(id?: string | null): string {
    if (!id) return 'NO DEFINIDO';
    const ts = this.tiposSoporte.find(x => String(x.id) === String(id));
    return ts ? (ts.name || 'NO DEFINIDO') : 'NO DEFINIDO';
  }

  mostrarSwalMitigacion(idEstatusTicket: string) {
    Swal.fire({
      title: 'Mitigación de Ticket',
      html: `
        <div class="text-start" style="font-family: inherit;">
          <label class="form-label fw-bold mb-1" style="font-size: 0.9rem;">Comentario Breve:</label>
          <textarea id="mitigacion-comentario" class="form-control mb-3" rows="3" placeholder="Ingrese el motivo o comentario de mitigación..." style="border-radius: 8px;"></textarea>
          
          <label class="form-label fw-bold mb-1" style="font-size: 0.9rem;">Fecha Estimada:</label>
          <input type="date" id="mitigacion-fecha" class="form-control" style="border-radius: 8px;">
        </div>
      `,
      width: '500px',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText: 'Guardar Mitigación',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost'
      },
      preConfirm: () => {
        const comentario = (document.getElementById('mitigacion-comentario') as HTMLTextAreaElement).value.trim();
        const fecha = (document.getElementById('mitigacion-fecha') as HTMLInputElement).value;
        if (!comentario) {
          Swal.showValidationMessage('El comentario es requerido');
          return false;
        }
        if (!fecha) {
          Swal.showValidationMessage('La fecha estimada es requerida');
          return false;
        }
        return { comentario, fecha };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.guardarMitigacion(idEstatusTicket, result.value.comentario, result.value.fecha);
      } else {
        if (this.estatusAnterior && this.ticket) {
          // Revert back
          setTimeout(() => {
            this.ticket!.idEstatusTicket = this.estatusAnterior!;
          });
        }
      }
    });
  }

  async guardarMitigacion(idEstatusTicket: string, comentario: string, fecha: string) {
    if (!this.ticket) return;

    const estatus = this.estatusTickets.find(x => String(x.id) === String(idEstatusTicket));
    this.ticket.idEstatusTicket = idEstatusTicket;
    
    this.ticketsService
      .update(this.ticket)
      .then(async () => {
        this.estatusAnterior = idEstatusTicket;
        await this.registrarBitacoraSistema(`Estatus actualizado a: <b>${estatus?.nombre || 'Mitigación'}</b>`);
        
        let responsable: any = null;
        const rawResp = localStorage.getItem('responsable-tareas');
        if (rawResp) {
          responsable = JSON.parse(rawResp);
        }
        
        const bitacoraEntry: Bitacora = {
          modulo: 'TICKETS',
          referenciaId: this.ticket!.id!,
          tipo: 'MITIGACION',
          contenido: `<b>Comentario:</b> ${comentario}<br><b>Fecha Estimada:</b> ${fecha}`,
          autor: {
            id: responsable?.id || this.usuario?.id || 'SISTEMA',
            nombre: responsable?.nombre || (this.usuario ? `${this.usuario.nombre} ${this.usuario.apellidoP}` : 'Sistema'),
            color: responsable?.color || '#94a3b8'
          },
          fechaCreacion: Timestamp.now()
        };
        await this.bitacoraService.addEntrada(bitacoraEntry);
        
        this.showMessage('success', 'Éxito', 'Estatus actualizado y mitigación registrada');
      })
      .catch((error) => {
        console.error(error);
        if (this.estatusAnterior) this.ticket!.idEstatusTicket = this.estatusAnterior;
      });
  }

  private showRatingSwal(
    title: string,
    message: string,
    confirmButtonText: string,
    onConfirm: (rating: number) => void
  ) {
    Swal.fire({
      title: title,
      html: `
        <style>
          .rating-container { display: flex; justify-content: center; gap: 8px; margin-top: 20px; flex-wrap: wrap; }
          .rating-option { 
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            cursor: pointer; padding: 12px 8px; border: 2px solid #e2e8f0; border-radius: 12px; 
            transition: all 0.2s ease; flex: 1; min-width: 70px; background: #ffffff;
          }
          .rating-option:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-2px); }
          .rating-option.selected { border-color: #D3152A; background: #FFF1F2; box-shadow: 0 4px 6px -1px rgba(211, 21, 42, 0.1); }
          .rating-stars { font-size: 1.2rem; line-height: 1; margin-bottom: 8px; color: #cbd5e1; letter-spacing: 1px; display: flex; }
          .rating-option:hover .rating-stars { color: #FDB813; }
          .rating-option.selected .rating-stars { color: #FDB813; }
          .rating-text { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; text-align: center; }
          .rating-option.selected .rating-text { color: #D3152A; font-weight: 800; }
        </style>
        <p class="text-muted" style="font-size: 0.95rem; margin-bottom: 5px;">${message}</p>
        <p class="text-dark fw-bold m-0 mt-3" style="font-size: 1.05rem;">Por favor, califica la atención recibida:</p>
        <div class="rating-container" id="custom-rating">
          <div class="rating-option" data-value="1">
            <div class="rating-stars">★</div>
            <div class="rating-text">Malo</div>
          </div>
          <div class="rating-option" data-value="2">
            <div class="rating-stars">★★</div>
            <div class="rating-text">Regular</div>
          </div>
          <div class="rating-option" data-value="3">
            <div class="rating-stars">★★★</div>
            <div class="rating-text">Bueno</div>
          </div>
          <div class="rating-option" data-value="4">
            <div class="rating-stars">★★★★</div>
            <div class="rating-text">Muy<br>Bueno</div>
          </div>
          <div class="rating-option" data-value="5">
            <div class="rating-stars">★★★★★</div>
            <div class="rating-text">Excelente</div>
          </div>
        </div>
        <input type="hidden" id="rating-value" value="">
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost'
      },
      didOpen: () => {
        const options = document.querySelectorAll('.rating-option');
        const input = document.getElementById('rating-value') as HTMLInputElement;
        options.forEach(opt => {
          opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            input.value = opt.getAttribute('data-value') || '';
            Swal.resetValidationMessage();
          });
        });
      },
      preConfirm: () => {
        const val = (document.getElementById('rating-value') as HTMLInputElement).value;
        if (!val) {
          Swal.showValidationMessage('Debes seleccionar una calificación para continuar');
          return false;
        }
        return Number(val);
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        onConfirm(result.value);
      }
    });
  }

  onClickTrabajarTicket() {
    if (!this.ticket) return;

    this.ticket.idEstatusTicket = '2';

    if (!this.ticket.fechaAtencion) {
      this.ticket.fechaAtencion = Timestamp.now();
    }

    this.ticketsService
      .update(this.ticket)
      .then(async () => {
        await this.registrarBitacoraSistema(`Ticket en atención (Trabajando)`);
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) => console.error(error));
  }

  onClickPendienteValidarSucursal() {
    this.showRatingSwal(
      'Validar Ticket',
      'El estado del ticket se cambiará a <b>POR VALIDAR</b>.',
      'Sí, enviar a validar',
      (rating) => {
        this.ticket!.idEstatusTicket = '7';
        this.ticket!.idResponsable = this.usuario.id;
        this.ticket!.calificacionAnalista = rating;

        this.ticketsService
          .update(this.ticket)
          .then(async () => {
            await this.registrarBitacoraSistema(`Ticket enviado a <b>VALIDAR</b> por el analista</b>`);
            this.showMessage('success', 'Éxito', 'Ticket enviado a validación correctamente');
          })
          .catch((error) => console.error(error));
      }
    );
  }

  onClickValidacionAdmin(ticket: Ticket | any) {
    Swal.fire({
      title: 'Confirmación',
      text: 'Validar ticket cerrado ¿Desea continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        ticket.validacionAdmin = true;
        this.ticketsService
          .update(ticket)
          .then(async () => {
            await this.registrarBitacoraSistema(`Validación de administrador <b>confirmada</b>`);
            this.showMessage('success', 'Éxito', 'Validación correcta');
          })
          .catch((error) => console.error(error));
      }
    });
  }

  onClickAsignarEspecialista() {
    this.idSucursalEspecialista = this.ticket?.idSucursal;
    this.mostrarModalEspecialistas = true;
  }

  onClickFinalizar(ticket: Ticket | any) {
    this.showRatingSwal(
      'Finalizar Ticket',
      'El ticket se cerrará y cambiará a <b>FINALIZADO</b>.',
      'Sí, finalizar ticket',
      (rating) => {
        ticket.idEstatusTicket = '3';
        ticket.calificacionSucursal = rating;
        ticket.fechaFin = Timestamp.now();

        this.ticketsService
          .update(ticket)
          .then(async () => {
            await this.registrarBitacoraSistema(`Ticket <b>FINALIZADO</b> por la sucursal</b>`);
            this.showMessage('success', 'Éxito', 'Ticket finalizado correctamente');
          })
          .catch((error) => console.error(error));
      }
    );
  }

  onClickRechazar(ticket: Ticket | any) {
    Swal.fire({
      title: 'Confirmación',
      text: 'El estado del ticket se cambiará a "POR RESOLVER" ¿Desea continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        ticket.idEstatusTicket = '1';
        this.ticketsService
          .update(ticket)
          .then(async () => {
            await this.registrarBitacoraSistema(`Soporte <b>RECHAZADO</b> por la sucursal. El ticket regresa a <b>POR RESOLVER</b>`);
            this.showMessage('success', 'Éxito', 'Enviado correctamente');
          })
          .catch((error) => console.error(error));
      }
    });
  }

  abrirModalImagen(url: string) {
    this.mostrarModalImagen = true;
    this.urlVisorImagen = url;
  }

  obtenerNombreArea(idArea?: string): string {
    if (!idArea) return '---';
    const found = this.areasService.areas?.find(a => String(a.id) === String(idArea));
    return found?.nombre || `Área ${idArea}`;
  }

  obtenerNombreSucursal(idSucursal?: any): string {
    if (!idSucursal) return '---';
    const found = this.sucursales?.find(s => String(s.id) === String(idSucursal));
    return found?.nombre || `Sucursal ${idSucursal}`;
  }

  obtenerEstatus(idStatus?: string): EstatusTicket | undefined {
    if (!idStatus) return undefined;
    return this.estatusTickets.find(s => String(s.id) === String(idStatus));
  }

  getEstatusStyle(estatus?: EstatusTicket): any {
    const c = estatus?.color && estatus.color.startsWith('#') ? estatus.color : '#64748B';
    return {
      'background-color': c + '1A',
      'color': c,
      'border': '1px solid ' + c + '40'
    };
  }

  obtenerPrioridadColor(prio?: string): { bg: string; text: string; border: string } {
    switch (prio) {
      case 'Crítico': return { bg: '#FFF1F2', text: '#EF4444', border: '#FECDD3' };
      case 'Alto': return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      case 'Medio': return { bg: '#FEFCE8', text: '#CA8A04', border: '#FEF08A' };
      case 'Bajo': return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
      default: return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
    }
  }

  get showBtnAsignar(): boolean {
    return this.usuario?.idArea === '4' &&
      this.usuario?.idRol === '5' &&
      this.ticket?.idEstatusTicket === '2' &&
      !this.ticket?.esAsignadoEspecialista;
  }

  get showBtnTrabajar(): boolean {
    return this.usuario?.idRol === '4' &&
      !!this.ticket?.idEstatusTicket &&
      ['1', '4', '6'].includes(this.ticket.idEstatusTicket);
  }

  get showBtnValidar(): boolean {
    return this.usuario?.idRol === '4' &&
      this.ticket?.idEstatusTicket === '2';
  }

  get showBtnFinalizar(): boolean {
    return this.usuario?.idRol === '2' && this.ticket?.idEstatusTicket === '7';
  }

  get showBtnRechazar(): boolean {
    return this.usuario?.idRol === '2' && this.ticket?.idEstatusTicket === '7';
  }

  get showBtnValidacionAdmin(): boolean {
    return (this.usuario?.idRol === '1' || this.usuario?.idRol === '5') &&
      this.ticket?.idEstatusTicket === '3' &&
      !this.ticket?.validacionAdmin;
  }

  async registrarBitacoraSistema(contenido: string): Promise<void> {
    if (!this.ticket?.id) return;
    let responsable: any = null;
    const rawResp = localStorage.getItem('responsable-tareas');
    if (rawResp) {
      responsable = JSON.parse(rawResp);
    }
    const bitacoraEntry: any = {
      modulo: 'TICKETS',
      referenciaId: this.ticket.id,
      tipo: 'SISTEMA',
      contenido: contenido,
      autor: {
        id: responsable?.id || 'SISTEMA',
        nombre: responsable?.nombre || 'Sistema',
        color: responsable?.color || '#94a3b8'
      },
      fechaCreacion: Timestamp.now()
    };
    await this.bitacoraService.addEntrada(bitacoraEntry);
  }
}
