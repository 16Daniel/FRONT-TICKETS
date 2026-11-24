import { ChangeDetectorRef, Component, OnDestroy, type OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

import ControlAceiteTabComponent from '../../components/control-aceite-tab/control-aceite-tab.component';
import { AgregarRecoleccionDialogComponent } from '../../dialogs/agregar-recoleccion-dialog/agregar-recoleccion-dialog.component';
import { HistorialAceiteTabComponent } from '../../components/historial-aceite-tab/historial-aceite-tab.component';
import { AceiteService } from '../../services/aceite.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { EntregaAceite } from '../../models/aceite.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { RegistrosPendientesTabComponent } from '../../components/registros-pendientes-tab/registros-pendientes-tab.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

export type TabAceiteId = 'PENDIENTES' | 'POR_VALIDAR' | 'HISTORIAL' | 'CONFIGURACION';

@Component({
  selector: 'app-aceite-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToastModule,
    DialogModule,
    CalendarModule,
    DropdownModule,
    TooltipModule,
    ControlAceiteTabComponent,
    AgregarRecoleccionDialogComponent,
    HistorialAceiteTabComponent,
    RegistrosPendientesTabComponent,
    MultiSelectModule,
    PageHeaderComponent
  ],
  providers: [MessageService],
  templateUrl: './aceite-page.component.html',
  styleUrl: './aceite-page.component.scss',
})
export default class AceitPageComponent implements OnInit, OnDestroy {
  public entregas: EntregaAceite[] = [];
  public entregasTodo: EntregaAceite[] = [];
  public mostrarModalValidacion: boolean = false;
  public sucursales: Sucursal[] = [];
  public sucursalesSel: Sucursal[] = [];
  public sucursalSel: Sucursal | undefined;
  public formcomentarios: string = '';
  public itemEntrega: EntregaAceite | undefined;
  public tipoActualizacion: number = 0;
  public loading: boolean = false;
  public modalAgregarRecoleccion: boolean = false;

  trampadeAceite: boolean = false;

  readonly tabs: { id: TabAceiteId; label: string; icono: string }[] = [
    { id: 'PENDIENTES', label: 'PENDIENTES', icono: 'bx bx-time-five' },
    { id: 'POR_VALIDAR', label: 'POR VALIDAR', icono: 'bx bx-check-double' },
    { id: 'HISTORIAL', label: 'HISTORIAL', icono: 'bx bx-history' },
    { id: 'CONFIGURACION', label: 'CONFIGURACIÓN', icono: 'bx bx-cog' },
  ];

  tabActivo: TabAceiteId = 'PENDIENTES';
  tabsActivados: Record<TabAceiteId, boolean> = {
    PENDIENTES: true,
    POR_VALIDAR: false,
    HISTORIAL: false,
    CONFIGURACION: false,
  };

  private branchesSub?: Subscription;
  private intervalRef?: ReturnType<typeof setInterval>;

  constructor(
    public aceiteService: AceiteService,
    public cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();

    this.intervalRef = setInterval(() => {
      this.consultarEntregas();
    }, 60000);
  }

  ngOnDestroy(): void {
    this.branchesSub?.unsubscribe();
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  cambiarTab(tabId: TabAceiteId): void {
    this.tabActivo = tabId;
    this.tabsActivados[tabId] = true;
    this.cdr.detectChanges();
  }

  get totalBajoMeta(): number {
    return this.entregas.filter((r) => r.intercambio == 1).length;
  }

  get totalOptimo(): number {
    return this.entregas.filter((r) => r.intercambio == 2).length;
  }

  get totalExcedente(): number {
    return this.entregas.filter((r) => r.intercambio == 3).length;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  consultarEntregas() {
    this.loading = true;
    this.aceiteService.getEntregasCedis().subscribe({
      next: (data) => {
        this.entregas = data;
        this.entregasTodo = [...data];
        this.filtrar();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirmodalValidacion(item: EntregaAceite, tipo: number) {
    this.tipoActualizacion = tipo;
    this.itemEntrega = item;
    this.mostrarModalValidacion = true;
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      const firestoreTimestamp = tsmp;
      const date = firestoreTimestamp.toDate();
      return date;
    } catch {
      return tsmp;
    }
  }

  obtenerNombreSucursal(idSucursal: number): string {
    const temp = this.sucursales.find((x) => x.idFront == idSucursal);
    return temp ? temp.nombre : '';
  }

  obtenerSucursales() {
    this.loading = true;
    this.branchesSub?.unsubscribe();
    this.branchesSub = this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data.filter((x) => x.idFront && x.idFront > -1);
        this.sucursalesSel = [...this.sucursales];
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

  actualizarEntrega() {
    if (this.formcomentarios.trim() === '') {
      this.showMessage('info', 'Información', 'Favor de agregar un comentario');
      return;
    }
    if (this.tipoActualizacion == 1) {
      this.loading = true;
      this.aceiteService.ValidacionCedis(this.itemEntrega!.id, this.formcomentarios).subscribe({
        next: () => {
          this.mostrarModalValidacion = false;
          this.showMessage('success', 'Correcto', 'Guardado correctamente');
          this.formcomentarios = '';
          this.consultarEntregas();
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.showMessage('error', 'Error', 'No se pudo guardar la validación');
          this.cdr.detectChanges();
        },
      });
    } else {
      this.loading = true;
      this.aceiteService.RechazoCedis(this.itemEntrega!.id, this.formcomentarios).subscribe({
        next: () => {
          this.mostrarModalValidacion = false;
          this.showMessage('success', 'Correcto', 'Guardado correctamente');
          this.formcomentarios = '';
          this.consultarEntregas();
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.showMessage('error', 'Error', 'No se pudo guardar el rechazo');
          this.cdr.detectChanges();
        },
      });
    }
  }

  abrirModalagregarRecoleccion() {
    this.modalAgregarRecoleccion = true;
    this.trampadeAceite = false;
  }

  abrirModalagregarRecoleccionTA() {
    this.modalAgregarRecoleccion = true;
    this.trampadeAceite = true;
  }

  filtrar() {
    this.entregas = [];
    for (const item of this.sucursalesSel) {
      const data = this.entregasTodo.filter((x) => x.idSucursal == item.idFront!);
      this.entregas.push(...data);
    }
    this.cdr.detectChanges();
  }

  exportarExcel(estrampa: boolean) {
    this.loading = true;

    const data = this.entregas;

    this.aceiteService.exportarHistorialEntregas(data).subscribe({
      next: (resp) => {
        this.loading = false;
        this.cdr.detectChanges();
        const base64String = resp.archivoBase64;
        const binaryString = window.atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ENTREGAS DE ACEITE POR VALIDAR.xlsx';
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      },
      error: (error) => {
        this.loading = false;
        this.showMessage('error', 'Error', 'Error al generar el archivo de excel');
        console.log(error);
        this.cdr.detectChanges();
      },
    });
  }
}
