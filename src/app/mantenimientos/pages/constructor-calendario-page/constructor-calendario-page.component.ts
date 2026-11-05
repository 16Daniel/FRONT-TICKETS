import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localeEs from '@angular/common/locales/es';
import { Timestamp } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { EditorModule } from 'primeng/editor';
import { Subscription } from 'rxjs';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DetalleTicketDialogComponent } from '../../../tickets/dialogs/detalle-ticket-dialog/detalle-ticket-dialog.component';
import { CalendarioComponent } from '../../components/calendario/calendario.component';
import { VisitaFiltrosToolbarComponent } from '../../components/visita-filtros-toolbar/visita-filtros-toolbar.component';
import { VisitaSucursalesPicklistComponent } from '../../components/visita-sucursales-picklist/visita-sucursales-picklist.component';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { Guardia } from '../../../tickets/interfaces/guardia';
import { Area } from '../../../areas/interfaces/area.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { ComentarioVisita } from '../../interfaces/comentario-visita.interface';
import { VisitaProgramada } from '../../interfaces/visita-programada.interface';
import { ParticipanteChat } from '../../../shared/interfaces/participante-chat.model';

import { TicketsService } from '../../../tickets/services/tickets.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { VisitasService } from '../../services/visitas.service';
import { GuardiasService } from '../../../tickets/services/guardias.service';
import { DocumentsService } from '../../../shared/services/documents.service';
import { MantenimientoFactoryService } from '../../services/maintenance-factory.service';
import { FixedAssetsService } from '../../../activos-fijos/services/fixed-assets.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { MaintenanceAvService } from '../../services/maintenance-av.service';
import { DispositivosSucursalesService } from '../../../sucursales/services/dispositivos-sucursales.service';

@Component({
  selector: 'app-constructor-calendario-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    EditorModule,
    PageHeaderComponent,
    DetalleTicketDialogComponent,
    CalendarioComponent,
    VisitaFiltrosToolbarComponent,
    VisitaSucursalesPicklistComponent,
  ],
  providers: [MessageService],
  templateUrl: './constructor-calendario-page.component.html',
  styleUrl: './constructor-calendario-page.component.scss',
})
export default class ContructorCalendarioPageComponent implements OnInit {
  sucursales: Sucursal[] = [];
  sucursalesOrdenadas: Sucursal[] = [];
  sucursalesSeleccionadas: Sucursal[] = [];
  usuariosHelp: Usuario[] = [];
  usuarioseleccionado: Usuario | undefined;
  fecha = new Date();
  tickets: Ticket[] = [];
  itemtk: Ticket | undefined;
  subscriptiontk: Subscription | undefined;
  loading: boolean = false;
  vercalendario: boolean = false;
  indicacionesVisitas: ComentarioVisita[] = [];
  registroDeVisita: VisitaProgramada | undefined = undefined;
  registroDeGuardia: Guardia | undefined = undefined;
  showModalTicketDetail: boolean = false;
  usuario: Usuario;
  area: Area | any;
  idArea: string = '1';

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private visitasService: VisitasService,
    private guardiaService: GuardiasService,
    private documentService: DocumentsService,
    private mantenimientoFactory: MantenimientoFactoryService,
    private fixedAssetsService: FixedAssetsService,
    private maintenanceAvService: MaintenanceAvService,
    private dispositivosSucursalesService: DispositivosSucursalesService,
    private datesHelper: DatesHelperService
  ) {
    registerLocaleData(localeEs);
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.idArea = this.usuario.idArea;
    this.obtenerSucursales();
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerSucursales(): void {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data.map((item: any) => ({ ...item, id: item.id.toString() }));
        this.obtenerTodosLosTickets();
        this.cdr.detectChanges();
      },
      error: () => this.showMessage('error', 'Error', 'Error al procesar la solicitud'),
    });
  }

  obtenerTodosLosTickets(): void {
    this.loading = true;
    const pesoPrioridad: Record<string, number> = { Crítico: 1, Alto: 2, Medio: 3, Bajo: 4 };

    this.subscriptiontk = this.ticketsService.get(this.usuario.idArea).subscribe({
      next: (data) => {
        this.tickets = [...data].sort((a, b) => {
          const pA = pesoPrioridad[a.prioridad] ?? 99;
          const pB = pesoPrioridad[b.prioridad] ?? 99;
          return pA !== pB ? pA - pB : b.fecha.toDate().getTime() - a.fecha.toDate().getTime();
        });
        if (this.itemtk !== undefined) {
          this.itemtk = this.tickets.find((x) => x.id == this.itemtk!.id) ?? this.itemtk;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al escuchar los tickets:', error);
      },
    });
  }

  async llenarInfoUsuario(): Promise<void> {
    this.sucursalesSeleccionadas = [];
    this.sucursalesOrdenadas = [];
    this.indicacionesVisitas = [];

    if (!this.vercalendario && this.usuarioseleccionado !== undefined) {
      this.loading = true;
      const visitas = await this.visitasService.obtenerVisitaUsuario(
        this.fecha,
        this.usuarioseleccionado.id
      );
      const guardias = await this.guardiaService.obtenerGuardiaUsuario(
        this.fecha,
        this.usuarioseleccionado.id,
        this.usuarioseleccionado.idArea
      );

      this.registroDeVisita = visitas.length > 0 ? visitas[0] : undefined;
      this.registroDeGuardia = guardias.length > 0 ? guardias[0] : undefined;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  private armarParticipantesChat(idUsuarioAnalista: string): ParticipanteChat[] {
    const ids = new Set<string>([idUsuarioAnalista]);
    for (const u of this.usersService.usuarios) {
      if (
        ((u.idRol == '5' || u.idRol == '1') && u.idArea == this.usuario.idArea) ||
        u.idRol == '2'
      ) {
        ids.add(u.id);
      }
    }
    return Array.from(ids).map((idUsuario) => ({ idUsuario, ultimoComentarioLeido: 0 }));
  }

  async guardarVisita(): Promise<void> {
    this.loading = true;
    if (this.sucursalesSeleccionadas.some((x) => x.id == '-999')) {
      this.registrarGuardia();
    }

    const sucursalesProgramadas = this.sucursalesSeleccionadas
      .filter((x) => x.id != '-999')
      .map((sucursal) => ({
        ...sucursal,
        idsTickets: this.tickets
          .filter((x) => x.idSucursal == sucursal.id)
          .map((t) => t.id),
      }));

    const visita: VisitaProgramada = {
      idUsuario: this.usuarioseleccionado!.id,
      fecha: Timestamp.fromDate(this.fecha),
      sucursalesProgramadas,
      comentarios: this.indicacionesVisitas,
      idArea: this.usuario.idArea,
    };

    try {
      await this.visitasService.create(visita);
      const participantesChat = this.armarParticipantesChat(this.usuarioseleccionado!.id);

      for (const sucursal of this.sucursalesSeleccionadas) {
        if (
          sucursal.id != '-999' &&
          sucursal.id != '-998' &&
          this.tieneMantenimientosActivos(sucursal.id)
        ) {
          const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);

          if (this.usuario.idArea == '4') {
            const freidoras = await this.fixedAssetsService.obtenerFredioras(sucursal.id);
            if (freidoras.length == 0) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Se registró la visita pero no se encontraron freidoras en activos fijos',
                life: 7000,
              });
            }
            freidoras.forEach(async (element) => {
              await servicio.create({
                idSucursal: sucursal.id,
                idUsuario: this.usuarioseleccionado!.id,
                fecha: this.fecha,
                participantesChat,
                idActivoFijo: element.id!,
                descripcion: element.descripcion,
                referencia: element.referencia,
              });
            });
          } else if (this.usuario.idArea != '2') {
            await servicio.create({
              idSucursal: sucursal.id,
              idUsuario: this.usuarioseleccionado!.id,
              fecha: this.fecha,
              participantesChat,
            });
            await this.registrarMantenimientoAudioVideo(sucursal, participantesChat);
          }
        }
      }

      this.showMessage('success', 'Success', 'Guardado correctamente');
      this.sucursalesOrdenadas = [];
      this.sucursalesSeleccionadas = [];
      this.usuarioseleccionado = undefined;
      this.registroDeGuardia = undefined;
      this.registroDeVisita = undefined;
      this.indicacionesVisitas = [];
    } catch {
      this.showMessage('error', 'Error', 'Error al guardar');
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  async registrarMantenimientoAudioVideo(
    sucursal: Sucursal,
    participantesChat: ParticipanteChat[]
  ): Promise<void> {
    if (this.usuario.idArea == '1') {
      const dispDoc = await this.dispositivosSucursalesService.getOnceBySucursalId(sucursal.id);
      const tvs = (dispDoc?.tvs ?? []).map((tv) => ({ dispositivo: tv, evidenciaUrls: [] }));
      const bocinas = (dispDoc?.bocinas ?? []).map((b) => ({ dispositivo: b, evidenciaUrls: [] }));

      await this.maintenanceAvService.create({
        idSucursal: String(sucursal.id),
        idUsuario: this.usuarioseleccionado!.id,
        fecha: this.fecha,
        tvs,
        bocinas,
        participantesChat,
      });
    }
  }

  tieneMantenimientosActivos(idSucursal: string | number): boolean {
    const sucursal = this.sucursales.find((s) => String(s.id) === String(idSucursal));
    return (
      !!sucursal &&
      Array.isArray(sucursal.activoMantenimientos) &&
      sucursal.activoMantenimientos.includes(String(this.usuario.idArea))
    );
  }

  async registrarGuardia(): Promise<void> {
    const guardia: Guardia = {
      idUsuario: this.usuarioseleccionado!.id,
      idArea: this.usuarioseleccionado!.idArea,
      fecha: Timestamp.fromDate(this.fecha),
    };
    try {
      await this.guardiaService.create(guardia);
      this.showMessage('success', 'Success', 'Guardado correctamente');
    } catch {}
  }

  actualizarListasComentarios(): void {
    this.indicacionesVisitas = [];
    for (const item of this.sucursalesSeleccionadas) {
      if (item.id != '-999') {
        const comentario =
          this.registroDeVisita?.comentarios.find((x) => x.idSucursal == item.id)?.comentario ??
          '';
        this.indicacionesVisitas.push({ idSucursal: item.id, comentario });
      }
    }
  }

  obtenerNombreSucursal(idSucursal: string): string {
    return this.sucursales.find((x) => x.id == idSucursal)?.nombre ?? '';
  }

  async actualizar(): Promise<void> {
    this.loading = true;
    if (this.registroDeGuardia !== undefined) {
      await this.documentService.deleteDocument('guardias', this.registroDeGuardia.id);
    }

    if (this.registroDeVisita !== undefined) {
      const fechaVisita = this.datesHelper.getDate(this.registroDeVisita.fecha);
      const servicio = this.mantenimientoFactory.getService(this.usuario.idArea);

      for (const sucursal of this.registroDeVisita.sucursalesProgramadas) {
        const temp = await servicio.obtenerMantenimientoVisitaPorFechaArea(
          fechaVisita,
          sucursal.id
        );
        temp.forEach(async (el: any) => await servicio.delete(el.id));

        const tempAv = await this.maintenanceAvService.obtenerMantenimientoVisitaPorFechaArea(
          fechaVisita,
          sucursal.id
        );
        tempAv.forEach(async (el: any) => await this.maintenanceAvService.delete(el.id));
      }

      await this.documentService.deleteDocument('visitas_programadas', this.registroDeVisita.id);
    }

    this.guardarVisita();
  }

  agregarActividad(texto: string): void {
    const actividad: any = { id: '-998', nombre: `ACTIVIDAD: ${texto}` };
    this.sucursalesSeleccionadas = [actividad, ...this.sucursalesSeleccionadas];
    this.actualizarListasComentarios();
  }
}
