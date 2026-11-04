import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

import { BranchesService } from '../../../sucursales/services/branches.service';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';
import { MantenimientosSistemasService } from '../../services/mantenimientos-sistemas.service';
import { MaintenanceAvService } from '../../services/maintenance-av.service';
import { MaintenanceMtooService } from '../../services/maintenance-mtto.service';
import { OpcionTabMantenimiento, TipoMantenimientoTab } from '../mantenimientos-admin-page/mantenimientos-admin-page.component';

@Component({
  selector: 'app-mantenimientos-analista-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    PageHeaderComponent,
    AcordeonMantenimientosSistemasComponent,
    AcordeonMantenimientosAudioVideoComponent,
    AcordeonMantenimientosMantenimientoComponent,
  ],
  providers: [MessageService],
  templateUrl: './mantenimientos-analista-page.component.html',
  styleUrl: './mantenimientos-analista-page.component.scss',
})
export default class MantenimientosAnalistaPageComponent implements OnInit, OnDestroy {
  usuario: Usuario;
  todasSucursales: Sucursal[] = [];

  ultimosmantenimientosSistemas: MantenimientoSys[] = [];
  ultimosmantenimientosAV: MantenimientoAudioVideo[] = [];
  ultimosmantenimientosMtto: MantenimientoMtto[] = [];

  tabsDisponibles: OpcionTabMantenimiento[] = [];
  tipoActivo: TipoMantenimientoTab = 'TI';

  ordenarMantenimientosFecha = false;
  auxMostrarMantenimientos = true;
  loading = false;

  private subs: Subscription[] = [];

  constructor(
    public cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private datesHelper: DatesHelperService,
    private mantenimientosSistemasService: MantenimientosSistemasService,
    private mantenimientosAvService: MaintenanceAvService,
    private maintenanceMttoService: MaintenanceMtooService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.configurarTabsPorUsuario();
    this.obtenerSucursales();
    this.obtenerUltimosMantenimientos();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private configurarTabsPorUsuario(): void {
    const todasLasTabs: OpcionTabMantenimiento[] = [
      { id: 'TI', idArea: '1', label: 'IT: 8X8 (SISTEMAS)', icono: 'bx bx-laptop' },
      { id: 'AV', idArea: '2', label: 'AV: 6X6 (AUDIO Y VIDEO)', icono: 'bx bx-tv' },
      { id: 'MTTO', idArea: '4', label: 'MANTENIMIENTO (8X8)', icono: 'bx bx-wrench' },
    ];

    if (this.usuario?.idArea == '1' || this.usuario?.idArea == '2') {
      this.tabsDisponibles = todasLasTabs.filter((t) => t.id === 'TI' || t.id === 'AV');
    } else if (this.usuario?.idArea == '4') {
      this.tabsDisponibles = todasLasTabs.filter((t) => t.id === 'MTTO');
    } else {
      this.tabsDisponibles = todasLasTabs;
    }

    if (this.tabsDisponibles.length > 0) {
      const tabArea = this.tabsDisponibles.find((t) => t.idArea === String(this.usuario?.idArea));
      this.tipoActivo = tabArea ? tabArea.id : this.tabsDisponibles[0].id;
    }
  }

  cambiarTab(tab: OpcionTabMantenimiento): void {
    this.tipoActivo = tab.id;
    this.cdr.detectChanges();
  }

  obtenerSucursales(): void {
    const sub = this.branchesService.get().subscribe((result) => {
      this.todasSucursales = result;
      this.cdr.detectChanges();
    });
    this.subs.push(sub);
  }

  obtenerUltimosMantenimientos(): void {
    const sucursales: Sucursal[] = this.usuario?.sucursales || [];
    const idsSucursales: string[] = sucursales.map((s) => s.id);
    if (idsSucursales.length === 0) return;

    this.loading = true;

    if (this.usuario?.idArea == '1' || this.usuario?.idArea == '2' || this.usuario?.idRol == '1') {
      const subAV = this.mantenimientosAvService
        .getUltimosMantenimientos(idsSucursales)
        .subscribe((result: any) => {
          const data = result.filter((element: any) => element.length > 0);
          const lista: MantenimientoAudioVideo[] = [];
          for (const itemdata of data) {
            for (const item of itemdata) {
              lista.push(item);
            }
          }
          this.ultimosmantenimientosAV = lista.map((x) => {
            x.fecha = this.datesHelper.getDate(x.fecha);
            return x;
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      this.subs.push(subAV);

      const subSys = this.mantenimientosSistemasService
        .getUltimosMantenimientos(idsSucursales)
        .subscribe((result: any) => {
          const data = result.filter((element: any) => element.length > 0);
          const lista: MantenimientoSys[] = [];
          for (const itemdata of data) {
            for (const item of itemdata) {
              lista.push(item);
            }
          }
          this.ultimosmantenimientosSistemas = lista.map((x) => {
            x.fecha = this.datesHelper.getDate(x.fecha);
            return x;
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      this.subs.push(subSys);
    }

    if (this.usuario?.idArea == '4' || this.usuario?.idRol == '1') {
      const subMtto = this.maintenanceMttoService
        .getUltimosMantenimientos(idsSucursales)
        .subscribe((result: any) => {
          const data = result.filter((element: any) => element.length > 0);
          const lista: MantenimientoMtto[] = [];
          for (const itemdata of data) {
            for (const item of itemdata) {
              lista.push(item);
            }
          }
          this.ultimosmantenimientosMtto = lista.map((x) => {
            x.fecha = this.datesHelper.getDate(x.fecha);
            return x;
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      this.subs.push(subMtto);
    }
  }

  sucursalesMantenimeintosActivos(areaIdToCheck?: string): Sucursal[] {
    const areaCheck = areaIdToCheck || String(this.usuario?.idArea || '1');
    const idsSucursalesUsuario = (this.usuario?.sucursales || []).map((s) => String(s.id));
    return this.todasSucursales.filter(
      (sucursal) =>
        idsSucursalesUsuario.includes(String(sucursal.id)) &&
        Array.isArray(sucursal.activoMantenimientos) &&
        sucursal.activoMantenimientos.includes(areaCheck)
    );
  }
}
