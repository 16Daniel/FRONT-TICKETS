import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { Timestamp } from '@angular/fire/firestore';

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
import { UsersService } from '../../../usuarios/services/users.service';
import { AvatarModule } from 'ngx-avatars';
import { TabViewModule } from 'primeng/tabview';
import { BitacoraComponent } from '../../../shared/components/bitacora/bitacora.component';
import { TaskResponsibleService } from '../../../tareas/services/task-responsible.service';

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
    BitacoraComponent
  ],
  templateUrl: './modal-ticket-detail.component.html',
  styleUrl: './modal-ticket-detail.component.scss',
})
export class ModalTicketDetailComponent implements OnInit {
  @Input() ticket: Ticket | undefined;
  @Input() showModalTicketDetail: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  usuario: Usuario;
  mostrarModalEspecialistas: boolean = false;
  mostrarModalImagen: boolean = false;
  idSucursalEspecialista: string = '';
  urlVisorImagen: string = '';
  sucursales: any[] = [];
  categorias: any[] = [];
  estatusTickets: EstatusTicket[] = [];

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    public datesHelper: DatesHelperService,
    private areasService: AreasService,
    private branchesService: BranchesService,
    private categoriesService: CategoriesService,
    private statusTicketService: StatusTicketService,
    private usersService: UsersService,
    public taskResponsibleService: TaskResponsibleService
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
        error: () => {}
      });
    }

    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data.map((item: any) => ({
          ...item,
          id: item.id.toString()
        }));
      },
      error: () => {}
    });

    this.statusTicketService.get().subscribe({
      next: (data) => {
        this.estatusTickets = data;
      },
      error: () => {}
    });
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  onClick() {
    this.actualizaTicket(this.ticket);
  }

  actualizaTicket(ticket: Ticket | any) {
    if (!ticket) return;
    ticket.idEstatusTicket = '2';
    if (!ticket.fechaAtencion) {
      ticket.fechaAtencion = Timestamp.now();
    }
    this.ticketsService
      .update(ticket)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) => console.error(error));
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onClickAsignarEspecialista() {
    this.idSucursalEspecialista = this.ticket?.idSucursal;
    this.mostrarModalEspecialistas = true;
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
           !['2', '3', '5', '7'].includes(this.ticket.idEstatusTicket);
  }
}
