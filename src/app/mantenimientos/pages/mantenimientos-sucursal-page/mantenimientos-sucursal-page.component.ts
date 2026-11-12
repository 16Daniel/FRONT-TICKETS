import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ModalTenXtenMaintenanceCheckComponent } from '../../dialogs/systems/modal-ten-xten-maintenance-check/modal-ten-xten-maintenance-check.component';
import { ModalTenXtenMaintenanceHistoryComponent } from '../../dialogs/systems/modal-ten-xten-maintenance-history/modal-ten-xten-maintenance-history.component';
import { CheckMantenimientoSisAvComponent } from '../../dialogs/sistemas-av/check-mantenimiento-sis-av-dialog/check-mantenimiento-sis-av-dialog.component';
import { HistorialMantenimeintoSysAvComponent } from '../../dialogs/sistemas-av/historial-mantenimiento-sys-av-dialog/historial-mantenimiento-sys-av-dialog.component';
import { ModalMaintenanceMttoHistoryComponent } from '../../dialogs/manteinance/modal-maintenance-mtto-history/modal-maintenance-mtto-history.component';
import { ModalMateinanceMttoCheckComponent } from '../../dialogs/manteinance/modal-mateinance-mtto-check/modal-mateinance-mtto-check.component';
import { ModalBranchRatingComponent } from '../../../tickets/components/modal-branch-rating/modal-branch-rating.component';

import { TablaMantenimientosSistemasComponent } from '../../components/tabla-mantenimientos-sistemas/tabla-mantenimientos-sistemas.component';
import { TablaMantenimientosAudioVideoComponent } from '../../components/tabla-mantenimientos-audio-video/tabla-mantenimientos-audio-video.component';
import { TablaMantenimientosMantenimientoComponent } from '../../components/tabla-mantenimientos-mantenimiento/tabla-mantenimientos-mantenimiento.component';
import { TpvsDevicesTableComponent } from '../../../sucursales/components/tpvs-devices-table/tpvs-devices-table.component';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { MantenimientoSys } from '../../interfaces/mantenimiento-sys.interface';
import { MantenimientoAudioVideo } from '../../interfaces/mantenimiento-audio-video.interface';
import { MantenimientoMtto } from '../../interfaces/mantenimiento-mtto.interface';

import { MantenimientosSistemasService } from '../../services/mantenimientos-sistemas.service';
import { MaintenanceAvService } from '../../services/maintenance-av.service';
import { MaintenanceMtooService } from '../../services/maintenance-mtto.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { OpcionTabMantenimiento, TipoMantenimientoTab } from '../mantenimientos-admin-page/mantenimientos-admin-page.component';

@Component({
  selector: 'app-mantenimientos-sucursal-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    PageHeaderComponent,
    ModalTenXtenMaintenanceCheckComponent,
    ModalTenXtenMaintenanceHistoryComponent,
    CheckMantenimientoSisAvComponent,
    HistorialMantenimeintoSysAvComponent,
    ModalMaintenanceMttoHistoryComponent,
    ModalMateinanceMttoCheckComponent,
    ModalBranchRatingComponent,
    TablaMantenimientosSistemasComponent,
    TablaMantenimientosAudioVideoComponent,
    TablaMantenimientosMantenimientoComponent,
    TpvsDevicesTableComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './mantenimientos-sucursal-page.component.html',
  styleUrl: './mantenimientos-sucursal-page.component.scss',
})
export default class MantenimientosSucursalPageComponent implements OnInit, OnDestroy {
  usuario: Usuario;
  sucursal: Sucursal | undefined;
  usuariosHelp: Usuario[] = [];

  tabsDisponibles: OpcionTabMantenimiento[] = [
    { id: 'TI', idArea: '1', label: 'SISTEMAS (8X8)', icono: 'bx bx-laptop' },
    { id: 'AV', idArea: '2', label: 'AUDIO Y VIDEO (6X6)', icono: 'bx bx-tv' },
    // { id: 'MTTO', idArea: '4', label: 'MANTENIMIENTO (8X8)', icono: 'bx bx-wrench' },
  ];
  tipoActivo: TipoMantenimientoTab = 'TI';

  // Mantenimientos activos para evaluar (Check)
  mantenimientoActivo: MantenimientoSys | null = null;
  mantenimientoAVActivo: MantenimientoAudioVideo | null = null;
  mantenimientosActivos: MantenimientoMtto[] = [];

  // Últimos mantenimientos de la sucursal para visualización directa
  ultimosMantenimientosTI: MantenimientoSys[] = [];
  ultimosMantenimientosAV: MantenimientoAudioVideo[] = [];
  ultimosMantenimientosMtto: MantenimientoMtto[] = [];

  // Banderas de Modales
  mostrarModalMtooTI = false;
  mostrarModalAV = false;
  mostrarModalManteinance = false;
  mostrarModalHistorialMantenimientos = false;
  mostrarModalHistorialMantenimientosAV = false;
  mostrarModalHistorialMantenimientosMtto = false;
  mostrarModalRating = false;
  mostrarTPVs = false;

  private unsubscribeIT?: () => void;
  private unsubscribeAV?: () => void;
  private unsubscribeMtto?: () => void;
  private subs: Subscription[] = [];

  constructor(
    public cdr: ChangeDetectorRef,
    private mantenimientosSistemasService: MantenimientosSistemasService,
    private maintenanceAvService: MaintenanceAvService,
    private maintenanceMtooService: MaintenanceMtooService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private datesHelper: DatesHelperService,
    private confirmationService: ConfirmationService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.sucursal = this.usuario?.sucursales?.[0];
  }

  ngOnInit(): void {
    this.cargarSucursalActualizada();
    this.obtenerUsuariosHelp();
    this.obtenerMantenimientosActivos();
    this.obtenerUltimosMantenimientosSucursal();
  }

  private cargarSucursalActualizada(): void {
    if (!this.sucursal?.id) return;
    const sub = this.branchesService.getById(this.sucursal.id).subscribe((sucursal) => {
      if (sucursal) {
        this.sucursal = sucursal;
        this.cdr.detectChanges();
      }
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    if (this.unsubscribeIT) this.unsubscribeIT();
    if (this.unsubscribeAV) this.unsubscribeAV();
    if (this.unsubscribeMtto) this.unsubscribeMtto();
    this.subs.forEach((s) => s.unsubscribe());
  }

  cambiarTab(tab: OpcionTabMantenimiento): void {
    this.tipoActivo = tab.id;
    this.cdr.detectChanges();
  }

  obtenerUsuariosHelp(): void {
    const sub = this.usersService.usuarios$.subscribe((usuarios) => {
      this.usuariosHelp = usuarios;
      this.cdr.detectChanges();
    });
    this.subs.push(sub);
  }

  obtenerMantenimientosActivos(): void {
    if (!this.sucursal?.id) return;

    this.unsubscribeIT = this.mantenimientosSistemasService.getMantenimientoActivo(
      this.sucursal.id,
      (mantenimiento) => {
        this.mantenimientoActivo = mantenimiento;
        this.cdr.detectChanges();
      }
    );

    this.unsubscribeAV = this.maintenanceAvService.getMantenimientoActivo(
      this.sucursal.id,
      (mantenimiento) => {
        this.mantenimientoAVActivo = mantenimiento;
        this.cdr.detectChanges();
      }
    );

    this.unsubscribeMtto = this.maintenanceMtooService.getMantenimientosActivosPorFecha(
      this.sucursal.id,
      (mantenimientos) => {
        this.mantenimientosActivos = mantenimientos;
        this.cdr.detectChanges();
      }
    );
  }

  obtenerUltimosMantenimientosSucursal(): void {
    if (!this.sucursal?.id) return;
    const ids = [this.sucursal.id];

    const subTI = this.mantenimientosSistemasService
      .getUltimosMantenimientos(ids)
      .subscribe((result) => {
        const filtered = result.filter((e) => e.length > 0);
        const lista: MantenimientoSys[] = [];
        for (const itemdata of filtered) {
          for (const item of itemdata) lista.push(item);
        }
        this.ultimosMantenimientosTI = lista.map((x) => {
          x.fecha = this.datesHelper.getDate(x.fecha);
          return x;
        });
        this.cdr.detectChanges();
      });
    this.subs.push(subTI);

    const subAV = this.maintenanceAvService
      .getUltimosMantenimientos(ids)
      .subscribe((result) => {
        const filtered = result.filter((e) => e.length > 0);
        const lista: MantenimientoAudioVideo[] = [];
        for (const itemdata of filtered) {
          for (const item of itemdata) lista.push(item);
        }
        this.ultimosMantenimientosAV = lista.map((x) => {
          x.fecha = this.datesHelper.getDate(x.fecha);
          return x;
        });
        this.cdr.detectChanges();
      });
    this.subs.push(subAV);

    const subMtto = this.maintenanceMtooService
      .getUltimosMantenimientos(ids)
      .subscribe((result) => {
        const filtered = result.filter((e) => e.length > 0);
        const lista: MantenimientoMtto[] = [];
        for (const itemdata of filtered) {
          for (const item of itemdata) lista.push(item);
        }
        this.ultimosMantenimientosMtto = lista.map((x) => {
          x.fecha = this.datesHelper.getDate(x.fecha);
          return x;
        });
        this.cdr.detectChanges();
      });
    this.subs.push(subMtto);
  }

  verificarSiHayMantenimiento(idArea: string): void {
    if (idArea === '1') {
      if (this.mantenimientoActivo?.id) {
        this.mostrarAlertaIT();
      } else {
        this.mostrarAvisoSinMantenimiento();
      }
    } else if (idArea === '2') {
      if (this.mantenimientoAVActivo?.id) {
        this.mostrarAlertaAV();
      } else {
        this.mostrarAvisoSinMantenimiento();
      }
    } else if (idArea === '4') {
      if (this.mantenimientosActivos.length > 0) {
        this.mostrarAlertaMtto();
      } else {
        this.mostrarAvisoSinMantenimiento();
      }
    }
  }

  private mostrarAvisoSinMantenimiento(): void {
    this.confirmationService.confirm({
      header: 'Validación de Mantenimiento',
      message: `
        <div class="confirm-content-wrapper">
          <div class="confirm-badge badge-info">
            <i class="bx bx-info-circle"></i>
            <span>Sin Mantenimiento Activo</span>
          </div>
          <h4 class="confirm-title">No hay mantenimiento pendiente</h4>
          <p class="confirm-desc">
            Actualmente no existe ningún mantenimiento activo por validar en tu sucursal.
          </p>
        </div>
      `,
      acceptLabel: 'Entendido',
      acceptIcon: 'pi pi-check',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectVisible: false,
      accept: () => {},
    });
  }

  mostrarAlertaIT(): void {
    this.confirmationService.confirm({
      header: 'Validación de Mantenimiento IT',
      message: `
        <div class="confirm-content-wrapper">
          <div class="confirm-badge badge-ti">
            <i class="bx bx-laptop"></i>
            <span>SISTEMAS (8 PUNTOS)</span>
          </div>
          <h4 class="confirm-title">Validación de Entrega de Sucursal</h4>
          <p class="confirm-desc">
            Debes validar las condiciones finales en las que el analista te está entregando la sucursal.
          </p>
          <div class="confirm-callout">
            <i class="bx bx-check-shield"></i>
            <span>Cada check confirma que recibes la sucursal en óptimas condiciones y nos dará pauta para agendar el próximo mantenimiento.</span>
          </div>
        </div>
      `,
      acceptLabel: 'Comenzar Validación',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.mostrarModalMtooTI = true;
      },
      reject: () => {},
    });
  }

  mostrarAlertaAV(): void {
    this.confirmationService.confirm({
      header: 'Validación de Audio y Video',
      message: `
        <div class="confirm-content-wrapper">
          <div class="confirm-badge badge-av">
            <i class="bx bx-tv"></i>
            <span>AUDIO Y VIDEO (6 PUNTOS)</span>
          </div>
          <h4 class="confirm-title">Validación de Entrega de Sucursal</h4>
          <p class="confirm-desc">
            Debes validar las condiciones finales en las que el analista te está entregando la sucursal.
          </p>
          <div class="confirm-callout">
            <i class="bx bx-check-shield"></i>
            <span>Cada check confirma que recibes la sucursal en óptimas condiciones y nos dará pauta para agendar el próximo mantenimiento.</span>
          </div>
        </div>
      `,
      acceptLabel: 'Comenzar Validación',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.mostrarModalAV = true;
      },
      reject: () => {},
    });
  }

  mostrarAlertaMtto(): void {
    this.confirmationService.confirm({
      header: 'Validación de Mantenimiento',
      message: `
        <div class="confirm-content-wrapper">
          <div class="confirm-badge badge-mtto">
            <i class="bx bx-wrench"></i>
            <span>MANTENIMIENTO GENERAL (8 PUNTOS)</span>
          </div>
          <h4 class="confirm-title">Validación de Entrega de Sucursal</h4>
          <p class="confirm-desc">
            Debes validar las condiciones finales en las que el analista te está entregando la sucursal.
          </p>
          <div class="confirm-callout">
            <i class="bx bx-check-shield"></i>
            <span>Cada check confirma que recibes la sucursal en óptimas condiciones y nos dará pauta para agendar el próximo mantenimiento.</span>
          </div>
        </div>
      `,
      acceptLabel: 'Comenzar Validación',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.mostrarModalManteinance = true;
      },
      reject: () => {},
    });
  }
}
