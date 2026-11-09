import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AcordeonMantenimientosSistemasComponent } from '../../components/acordeon-mantenimientos-sistemas/acordeon-mantenimientos-sistemas.component';
import { AcordeonMantenimientosAudioVideoComponent } from '../../components/acordeon-mantenimientos-audio-video/acordeon-mantenimientos-audio-video.component';
import { AcordeonMantenimientosMantenimientoComponent } from '../../components/acordeon-mantenimientos-mantenimiento/acordeon-mantenimientos-mantenimiento.component';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { MantenimientoSys } from '../../interfaces/mantenimiento-sys.interface';
import { MantenimientoAudioVideo } from '../../interfaces/mantenimiento-audio-video.interface';
import { MantenimientoMtto } from '../../interfaces/mantenimiento-mtto.interface';

import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { MantenimientosSistemasService } from '../../services/mantenimientos-sistemas.service';
import { MaintenanceAvService } from '../../services/maintenance-av.service';
import { MaintenanceMtooService } from '../../services/maintenance-mtto.service';

export type TipoMantenimientoTab = 'TI' | 'AV' | 'MTTO';

export interface OpcionTabMantenimiento {
  id: TipoMantenimientoTab;
  idArea: string;
  label: string;
  icono: string;
}

@Component({
  selector: 'app-mantenimientos-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    OverlayPanelModule,
    ToastModule,
    PageHeaderComponent,
    AcordeonMantenimientosSistemasComponent,
    AcordeonMantenimientosAudioVideoComponent,
    AcordeonMantenimientosMantenimientoComponent,
  ],
  providers: [MessageService],
  templateUrl: './mantenimientos-admin-page.component.html',
  styleUrl: './mantenimientos-admin-page.component.scss',
})
export default class MantenimientosAdminPageComponent implements OnInit, OnDestroy {
  usuario: Usuario;
  sucursales: Sucursal[] = [];
  usuariosHelp: Usuario[] = [];
  usergroup: Usuario | undefined;

  mantenimientosTI: MantenimientoSys[] = [];
  mantenimientosAV: MantenimientoAudioVideo[] = [];
  mantenimientosMtto: MantenimientoMtto[] = [];

  tabsDisponibles: OpcionTabMantenimiento[] = [];
  tipoActivo: TipoMantenimientoTab = 'TI';

  auxMostrarMantenimientos = true;
  ordenarMantenimientosFecha = false;
  loading = false;

  private subs: Subscription[] = [];

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private datesHelper: DatesHelperService,
    private maintenanceSysService: MantenimientosSistemasService,
    private maintenanceAvService: MaintenanceAvService,
    private maintenanceMttoService: MaintenanceMtooService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.configurarTabsPorUsuario();
    this.obtenerSucursalesYMantenimientos();
    this.obtenerUsuariosHelp();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private configurarTabsPorUsuario(): void {
    const todasLasTabs: OpcionTabMantenimiento[] = [
      { id: 'TI', idArea: '1', label: 'MANTENIMIENTO IT (8X8)', icono: 'bx bx-laptop' },
      { id: 'AV', idArea: '2', label: 'MANTENIMIENTO AV (6X6)', icono: 'bx bx-tv' },
      // { id: 'MTTO', idArea: '4', label: 'MANTENIMIENTO (8X8)', icono: 'bx bx-wrench' },
    ];

    if (this.usuario?.idRol === '1') {
      this.tabsDisponibles = todasLasTabs;
    } else if (this.usuario?.idArea === '1' || this.usuario?.idArea === '2') {
      this.tabsDisponibles = todasLasTabs.filter((t) => t.id === 'TI' || t.id === 'AV');
    } else if (this.usuario?.idArea === '4') {
      this.tabsDisponibles = todasLasTabs.filter((t) => t.id === 'MTTO');
    } else {
      this.tabsDisponibles = todasLasTabs;
    }

    if (this.tabsDisponibles.length > 0) {
      const tabAreaUsuario = this.tabsDisponibles.find((t) => t.idArea === String(this.usuario?.idArea));
      this.tipoActivo = tabAreaUsuario ? tabAreaUsuario.id : this.tabsDisponibles[0].id;
    }
  }

  get idAreaActiva(): string {
    const tab = this.tabsDisponibles.find((t) => t.id === this.tipoActivo);
    return tab ? tab.idArea : '1';
  }

  cambiarTab(tab: OpcionTabMantenimiento): void {
    if (this.tipoActivo === tab.id) return;
    this.tipoActivo = tab.id;
    this.usergroup = undefined;
    this.obtenerUsuariosHelp();
    this.cdr.detectChanges();
  }

  obtenerUsuariosHelp(): void {
    const sub = this.usersService
      .getUsuariosPorRol(['4', '7'], this.idAreaActiva)
      .subscribe((usuarios) => {
        this.usuariosHelp = usuarios;
        this.cdr.detectChanges();
      });
    this.subs.push(sub);
  }

  obtenerSucursalesYMantenimientos(): void {
    this.loading = true;
    const subBranches = this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        const idsSucursales = this.sucursales.map((s) => s.id);

        const puedeVerTIoAV =
          this.usuario?.idRol === '1' ||
          this.usuario?.idArea === '1' ||
          this.usuario?.idArea === '2';
        const puedeVerMtto =
          this.usuario?.idRol === '1' || this.usuario?.idArea === '4';

        if (puedeVerTIoAV) {
          const subTI = this.maintenanceSysService
            .getUltimosMantenimientos(idsSucursales)
            .subscribe((result) => {
              const filtered = result.filter((e) => e.length > 0);
              const lista: MantenimientoSys[] = [];
              for (const itemdata of filtered) {
                for (const item of itemdata) lista.push(item);
              }
              this.mantenimientosTI = lista.map((x) => {
                x.fecha = this.datesHelper.getDate(x.fecha);
                return x;
              });
              this.loading = false;
              this.cdr.detectChanges();
            });
          this.subs.push(subTI);

          const subAV = this.maintenanceAvService
            .getUltimosMantenimientos(idsSucursales)
            .subscribe((result) => {
              const filtered = result.filter((e) => e.length > 0);
              const lista: MantenimientoAudioVideo[] = [];
              for (const itemdata of filtered) {
                for (const item of itemdata) lista.push(item);
              }
              this.mantenimientosAV = lista.map((x) => {
                x.fecha = this.datesHelper.getDate(x.fecha);
                return x;
              });
              this.loading = false;
              this.cdr.detectChanges();
            });
          this.subs.push(subAV);
        }

        if (puedeVerMtto) {
          const subMtto = this.maintenanceMttoService
            .getUltimosMantenimientos(idsSucursales)
            .subscribe((result) => {
              const filtered = result.filter((e) => e.length > 0);
              const lista: MantenimientoMtto[] = [];
              for (const itemdata of filtered) {
                for (const item of itemdata) lista.push(item);
              }
              this.mantenimientosMtto = lista.map((x) => {
                x.fecha = this.datesHelper.getDate(x.fecha);
                return x;
              });
              this.loading = false;
              this.cdr.detectChanges();
            });
          this.subs.push(subMtto);
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al obtener sucursales y mantenimientos',
        });
      },
    });
    this.subs.push(subBranches);
  }

  agrupar(user: Usuario): void {
    this.usergroup = user;
    this.cdr.detectChanges();
  }

  agruparPorSucursal(): void {
    this.usergroup = undefined;
    this.cdr.detectChanges();
  }

  sucursalesMantenimeintosActivos(areaIdToCheck: string): Sucursal[] {
    if (this.usergroup !== undefined) {
      const idsSucursalesUsuario = this.usergroup?.sucursales.map((s) => String(s.id));
      return this.sucursales.filter(
        (sucursal) =>
          idsSucursalesUsuario?.includes(String(sucursal.id)) &&
          Array.isArray(sucursal.activoMantenimientos) &&
          sucursal.activoMantenimientos.includes(areaIdToCheck)
      );
    } else {
      return this.sucursales.filter(
        (sucursal) =>
          Array.isArray(sucursal.activoMantenimientos) &&
          sucursal.activoMantenimientos.includes(areaIdToCheck)
      );
    }
  }
}
