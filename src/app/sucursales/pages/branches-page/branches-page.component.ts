import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';

import { BranchesService } from '../../services/branches.service';
import { Sucursal } from '../../interfaces/sucursal.interface';
import { CrearSucursalDialogComponent } from '../../dialogs/crear-sucursal-dialog/crear-sucursal-dialog.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { UsersService } from '../../../usuarios/services/users.service';

@Component({
  selector: 'app-branches-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    ToastModule,
    TooltipModule,
    InputTextModule,
    ConfirmDialogModule,
    CrearSucursalDialogComponent,
    PageHeaderComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './branches-page.component.html',
  styleUrl: './branches-page.component.scss'
})

export default class BranchesPageComponent implements OnInit, OnDestroy {
  readonly String = String;
  esNuevaSucursal: boolean = false;
  mostrarModalSucursal: boolean = false;
  sucursales: Sucursal[] = [];
  sucursalSeleccionada: Sucursal = new Sucursal;
  
  areas: Area[] = [];
  areaSeleccionadaId: string = '';
  usuariosSoporte: Usuario[] = [];
  todosUsuarios: Usuario[] = [];

  subscripcion: Subscription | undefined;
  private subscripcionAreas?: Subscription;
  private subscripcionUsuarios?: Subscription;

  constructor(
    private confirmationService: ConfirmationService,
    private branchesServicce: BranchesService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private areasService: AreasService,
    private usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.cargarAreas();
    this.cargarUsuarios();
  }

  ngOnDestroy() {
    if (this.subscripcion != undefined) {
      this.subscripcion.unsubscribe();
    }
    if (this.subscripcionAreas) {
      this.subscripcionAreas.unsubscribe();
    }
    if (this.subscripcionUsuarios) {
      this.subscripcionUsuarios.unsubscribe();
    }
  }

  private cargarAreas(): void {
    this.subscripcionAreas = this.areasService.areas$.subscribe((areas: Area[]) => {
      this.areas = areas.filter((a: Area) => !a.eliminado);
      
      // Select the first area by default if none is selected or if the selected one is not valid
      if (this.areas.length > 0 && !this.areas.some((a: Area) => String(a.id) === this.areaSeleccionadaId)) {
        this.areaSeleccionadaId = String(this.areas[0].id);
      }
      
      this.filtrarUsuariosSoporte();
      this.cdr.detectChanges();
    });
  }

  private cargarUsuarios(): void {
    this.subscripcionUsuarios = this.usersService.usuarios$.subscribe(usuarios => {
      this.todosUsuarios = usuarios;
      this.filtrarUsuariosSoporte();
      this.cdr.detectChanges();
    });
  }

  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    this.filtrarUsuariosSoporte();
  }

  filtrarUsuariosSoporte(): void {
    this.usuariosSoporte = this.todosUsuarios.filter(u => 
      String(u.idRol) === '4' && String(u.idArea) === this.areaSeleccionadaId
    );
    this.cdr.detectChanges();
  }

  obtenerSoporte(sucursal: Sucursal): string {
    const usuario = this.usuariosSoporte.find(u => u.sucursales?.some(s => s.id === sucursal.id));
    return usuario ? `${usuario.nombre} ${usuario.apellidoP}` : 'Sin asignar';
  }

  obtenerSucursales = () =>
    this.subscripcion = this.branchesServicce.get().subscribe(result => {
      this.sucursales = result;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(error);
      this.showMessage('error', 'Error', 'Error al procesar la solicitud');
    });

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  abrirModalCrearSucursal() {
    this.esNuevaSucursal = true;
    this.mostrarModalSucursal = true;
  }

  abrirModalEditarSucursal(sucursal: Sucursal) {
    this.esNuevaSucursal = false;
    this.mostrarModalSucursal = true;
    this.sucursalSeleccionada = sucursal;
  }

  confirmaEliminacion(id: string | any) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.eliminarSucursal(id);
      },
      reject: () => { },
    });
  }

  async eliminarSucursal(idSucursal: string) {
    await this.branchesServicce.delete(idSucursal);
    this.showMessage('success', 'Success', 'Eliminada correctamente');
  }

  cerrarModalSucursal() {
    this.mostrarModalSucursal = false;
    this.sucursalSeleccionada = new Sucursal;
  }
}
