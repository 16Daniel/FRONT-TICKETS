import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { Timestamp } from '@angular/fire/firestore';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { AceiteService } from '../../services/aceite.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { UsuarioSucursalService } from '../../../sucursales/services/usuario-sucursal.service';
import { EntregaAceite } from '../../models/aceite.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-recoleccion-aceite-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TabViewModule, ToastModule, DialogModule, CalendarModule, DropdownModule, MultiSelectModule],
  providers: [MessageService],
  templateUrl: './recoleccion-aceite-page.component.html',
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
  public formcomentarios: string = "";
  public itemEntrega: EntregaAceite | undefined;
  public tipoActualizacion: number = 0;
  public loading: boolean = false;
  fechaini: Date = new Date();
  fechafin: Date = new Date();
  usuario: Usuario;
  esTrampadeAceite: boolean = false;
   public mostrarModalHistorial: boolean = false;

  private sucursalesSub?: Subscription;
  private intervaloRef?: ReturnType<typeof setInterval>;

  constructor(
    public aceiteService: AceiteService,
    public cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private usuarioSucursalService: UsuarioSucursalService,
    private messageService: MessageService) {
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
    if (this.intervaloRef) {
      clearInterval(this.intervaloRef);
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  consultarEntregas() {
    this.loading = true;
    this.aceiteService.getEntregasCedis().subscribe({
      next: (data) => {
        this.entregas = [];
        this.TodasLasEntregas = data;
        const sucursalesUsuario = this.obtenerSucursaleUsuario();
        for (const suc of sucursalesUsuario) {
          const temp = this.TodasLasEntregas.filter(x => x.idSucursal == suc.idFront);
          this.entregas = [...this.entregas, ...temp];
        }
        this.loading = false;
        this.consultarEntregasTA();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
      },
    });
  }

  consultarEntregasTA() {
    this.loading = true;
    this.aceiteService.getEntregasCedisTA().subscribe({
      next: (data) => {
        this.entregasTA = [];
        this.TodasLasEntregasTA = data;
        const sucursalesUsuario = this.obtenerSucursaleUsuario();
        for (const suc of sucursalesUsuario) {
          const temp = this.TodasLasEntregasTA.filter(x => x.idSucursal == suc.idFront);
          this.entregasTA = [...this.entregasTA, ...temp];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
      },
    });
  }

  abrirmodalValidacion(item: EntregaAceite, tipo: number, trampadeaceite: boolean) {
    this.tipoActualizacion = tipo;
    this.itemEntrega = item;
    this.esTrampadeAceite = trampadeaceite;
    this.mostrarModalValidacion = true;
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    } catch {
      return tsmp;
    }
  }

  obtenerNombreSucursal(idSucursal: number): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.idFront == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  obtenerSucursales() {
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
      },
    });
  }

  actualizarEntrega() {
    if (this.formcomentarios == "") {
      this.showMessage('info', 'info', 'Favor de agregar un comentario');
      return;
    }
    if (this.tipoActualizacion == 1) {
      this.loading = true;
      this.aceiteService.ValidacionCedis(this.itemEntrega!.id, this.formcomentarios).subscribe({
        next: (data) => {
          this.mostrarModalValidacion = false;
          this.showMessage('success', 'Success', 'Guardado correctamente');
          this.formcomentarios = "";
          this.consultarEntregas();
          this.cdr.detectChanges();
        },
        error: (error) => {

        },
      });
    } else {
      this.loading = true;
      this.aceiteService.RechazoCedis(this.itemEntrega!.id, this.formcomentarios).subscribe({
        next: (data) => {
          this.mostrarModalValidacion = false;
          this.showMessage('success', 'Success', 'Guardado correctamente');
          this.formcomentarios = "";
          this.consultarEntregas();
          this.cdr.detectChanges();
        },
        error: (error) => {

        },
      });
    }

  }

  actualizarEntregaTA() {
    if (this.formcomentarios == "") {
      this.showMessage('info', 'info', 'Favor de agregar un comentario');
      return;
    }
    if (this.tipoActualizacion == 1) {
      this.loading = true;
      this.aceiteService.ValidacionCedisTA(this.itemEntrega!.id, this.formcomentarios).subscribe({
        next: (data) => {
          this.mostrarModalValidacion = false;
          this.showMessage('success', 'Success', 'Guardado correctamente');
          this.formcomentarios = "";
          this.consultarEntregas();
          this.cdr.detectChanges();
        },
        error: (error) => {

        },
      });
    } else {
      this.loading = true;
      this.aceiteService.RechazoCedisTA(this.itemEntrega!.id, this.formcomentarios).subscribe({
        next: (data) => {
          this.mostrarModalValidacion = false;
          this.showMessage('success', 'Success', 'Guardado correctamente');
          this.formcomentarios = "";
          this.consultarEntregas();
          this.cdr.detectChanges();
        },
        error: (error) => {

        },
      });
    }

  }
   
  abrirModalHistorial()
  {
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
  buscarRegistros()
  {
     this.entregasH = []; 
     this.loading = true
    let temp: number[] = [];
    for (let item of this.sucursalesSel) {
      temp.push(item.idFront!);
    }
    let idf = JSON.stringify(temp);
    this.aceiteService.getEntregasCedisH(idf, this.fechaini, this.fechafin).subscribe({
      next: (data) => {
        this.entregasH = data;
        this.loading = false,
          this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
      },
    });
  }
}
