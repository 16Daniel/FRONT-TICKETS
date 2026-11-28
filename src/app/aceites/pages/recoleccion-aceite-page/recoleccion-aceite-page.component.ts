import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { combineLatest, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Sucursal } from '../../../sucursales/models/sucursal.model';
import { SucursalesService } from '../../../sucursales/services/sucursales.service';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';
import { EntregaAceite } from '../../models/aceite.model';
import { AceiteService } from '../../services/aceite.service';

export type TabRecoleccionId = 'ACEITE' | 'TRAMPA';

@Component({
  selector: 'app-recoleccion-aceite-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToastModule,
    DialogModule,
    CalendarModule,
    DropdownModule,
    MultiSelectModule,
    TooltipModule,
    PageHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './recoleccion-aceite-page.component.html',
  styleUrl: './recoleccion-aceite-page.component.scss',
})
export default class RecoleccionAceitePageComponent implements OnInit, OnDestroy {
  public TodasLasEntregas: EntregaAceite[] = [];
  public TodasLasEntregasTA: EntregaAceite[] = [];
  public entregas: EntregaAceite[] = [];
  public entregasH: EntregaAceite[] = [];
  public entregasTA: EntregaAceite[] = [];
  public mostrarModalValidacion: boolean = false;
  public sucursales: Sucursal[] = [];
  public sucursalSel: Sucursal[] = [];
  public sucursalesSel: Sucursal[] = [];
  public formcomentarios: string = '';
  public itemEntrega: EntregaAceite | undefined;
  public tipoActualizacion: number = 0;
  public loading: boolean = false;
  public loadingHistorial: boolean = false;
  public historialConsultado: boolean = false;
  fechaini: Date = new Date();
  fechafin: Date = new Date();
  usuario: Usuario;
  esTrampadeAceite: boolean = false;
  public mostrarModalHistorial: boolean = false;

  public tabActivo: TabRecoleccionId = 'ACEITE';
  public readonly tabs: { id: TabRecoleccionId; label: string; icono: string }[] = [
    { id: 'ACEITE', label: 'RECOLECCIÓN DE ACEITE', icono: 'bx bx-droplet' },
    { id: 'TRAMPA', label: 'RECOLECCIÓN TRAMPA DE GRASA', icono: 'bx bx-filter-alt' },
  ];

  private sucursalesSub?: Subscription;
  private entregasSub?: Subscription;
  private entregasTASub?: Subscription;
  private historialSub?: Subscription;
  private intervaloRef?: ReturnType<typeof setInterval>;

  constructor(
    public aceiteService: AceiteService,
    public cdr: ChangeDetectorRef,
    private branchesService: SucursalesService,
    private usuarioSucursalService: UsuarioSucursalService,
    private messageService: MessageService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.obtenerSucursales();

    this.intervaloRef = setInterval(() => {
      this.consultarEntregas();
    }, 60000);
  }

  ngOnDestroy(): void {
    this.sucursalesSub?.unsubscribe();
    this.entregasSub?.unsubscribe();
    this.entregasTASub?.unsubscribe();
    this.historialSub?.unsubscribe();
    if (this.intervaloRef) {
      clearInterval(this.intervaloRef);
    }
  }

  cambiarTab(tab: TabRecoleccionId): void {
    this.tabActivo = tab;
    this.cdr.detectChanges();
  }

  get entregasActivas(): EntregaAceite[] {
    return this.tabActivo === 'ACEITE' ? this.entregas : this.entregasTA;
  }

  get totalBajoMeta(): number {
    return this.entregasActivas.filter((e) => e.intercambio == 1).length;
  }

  get totalOptimo(): number {
    return this.entregasActivas.filter((e) => e.intercambio == 2).length;
  }

  get totalExcedente(): number {
    return this.entregasActivas.filter((e) => e.intercambio == 3).length;
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  consultarEntregas(): void {
    this.loading = true;
    this.entregasSub?.unsubscribe();
    this.entregasSub = this.aceiteService.getEntregasCedis().subscribe({
      next: (data) => {
        this.entregas = [];
        this.TodasLasEntregas = data;
        const sucursalesUsuario = this.obtenerSucursaleUsuario();
        for (const suc of sucursalesUsuario) {
          const temp = this.TodasLasEntregas.filter((x) => x.idSucursal == suc.idFront);
          this.entregas = [...this.entregas, ...temp];
        }
        this.loading = false;
        this.consultarEntregasTA();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al consultar entregas CEDIS:', error);
        this.cdr.detectChanges();
      },
    });
  }

  consultarEntregasTA(): void {
    this.loading = true;
    this.entregasTASub?.unsubscribe();
    this.entregasTASub = this.aceiteService.getEntregasCedisTA().subscribe({
      next: (data) => {
        this.entregasTA = [];
        this.TodasLasEntregasTA = data;
        const sucursalesUsuario = this.obtenerSucursaleUsuario();
        for (const suc of sucursalesUsuario) {
          const temp = this.TodasLasEntregasTA.filter((x) => x.idSucursal == suc.idFront);
          this.entregasTA = [...this.entregasTA, ...temp];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al consultar entregas TA CEDIS:', error);
        this.cdr.detectChanges();
      },
    });
  }

  abrirmodalValidacion(item: EntregaAceite, tipo: number, trampadeaceite: boolean): void {
    this.tipoActualizacion = tipo;
    this.itemEntrega = item;
    this.esTrampadeAceite = trampadeaceite;
    this.formcomentarios = '';
    this.mostrarModalValidacion = true;
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      const firestoreTimestamp = tsmp;
      return firestoreTimestamp.toDate();
    } catch {
      return tsmp;
    }
  }

  obtenerNombreSucursal(idSucursal: number): string {
    const match = this.sucursales.find((x) => x.idFront == idSucursal);
    return match ? match.nombre : '';
  }

  obtenerSucursales(): void {
    this.loading = true;
    this.sucursalesSub?.unsubscribe();
    this.sucursalesSub = combineLatest([
      this.branchesService.get(),
      this.usuarioSucursalService.usuarioSucursal$,
    ]).subscribe({
      next: ([data]) => {
        this.sucursales = data;
        this.loading = false;
        this.consultarEntregas();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  actualizarEntrega(): void {
    if (!this.formcomentarios.trim()) {
      this.showMessage('warn', 'Atención', 'Favor de agregar un comentario');
      return;
    }

    this.loading = true;
    const peticion$ =
      this.tipoActualizacion == 1
        ? this.aceiteService.ValidacionCedis(this.itemEntrega!.id, this.formcomentarios)
        : this.aceiteService.RechazoCedis(this.itemEntrega!.id, this.formcomentarios);

    peticion$.subscribe({
      next: () => {
        this.mostrarModalValidacion = false;
        this.showMessage('success', 'Éxito', 'Guardado correctamente');
        this.formcomentarios = '';
        this.consultarEntregas();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al actualizar entrega:', error);
        this.loading = false;
        this.showMessage('error', 'Error', 'No se pudo actualizar la recolección');
        this.cdr.detectChanges();
      },
    });
  }

  actualizarEntregaTA(): void {
    if (!this.formcomentarios.trim()) {
      this.showMessage('warn', 'Atención', 'Favor de agregar un comentario');
      return;
    }

    this.loading = true;
    const peticion$ =
      this.tipoActualizacion == 1
        ? this.aceiteService.ValidacionCedisTA(this.itemEntrega!.id, this.formcomentarios)
        : this.aceiteService.RechazoCedisTA(this.itemEntrega!.id, this.formcomentarios);

    peticion$.subscribe({
      next: () => {
        this.mostrarModalValidacion = false;
        this.showMessage('success', 'Éxito', 'Guardado correctamente');
        this.formcomentarios = '';
        this.consultarEntregas();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al actualizar entrega TA:', error);
        this.loading = false;
        this.showMessage('error', 'Error', 'No se pudo actualizar la recolección');
        this.cdr.detectChanges();
      },
    });
  }

  abrirModalHistorial(): void {
    this.mostrarModalHistorial = true;
  }

  obtenerSucursaleUsuario(): Sucursal[] {
    const idsAsignadas = this.usuarioSucursalService.obtenerSucursalesPorUsuario(
      'RECOLECCION_ACEITE',
      String(this.usuario.id),
      this.usuario.idArea
    );
    return this.sucursales.filter((s) => idsAsignadas.includes(String(s.id)));
  }

  buscarRegistros(): void {
    this.entregasH = [];
    this.loadingHistorial = true;
    this.historialConsultado = true;

    const temp: number[] = [];
    for (const item of this.sucursalesSel) {
      temp.push(item.idFront!);
    }
    const idf = JSON.stringify(temp);

    this.historialSub?.unsubscribe();
    this.historialSub = this.aceiteService
      .getEntregasCedisH(idf, this.fechaini, this.fechafin)
      .subscribe({
        next: (data) => {
          this.entregasH = data;
          this.loadingHistorial = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loadingHistorial = false;
          console.error('Error al consultar historial CEDIS:', error);
          this.showMessage('error', 'Error', 'No se pudo consultar el historial');
          this.cdr.detectChanges();
        },
      });
  }
}
