import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';

import { BranchesService } from '../../../../services/branches.service';
import { Sucursal } from '../../../../models/sucursal.model';
import { Usuario } from '../../../../models/usuario.model';
import { Rol } from '../../../../models/rol.model';
import { DocumentsService } from '../../../../services/documents.service';
import { RolesService } from '../../../../services/roles.service';
import { ModalUserCreateComponent } from '../../../../modals/users/modal-user-create/modal-user-create.component';
import { UsersService } from '../../../../services/users.service';

@Component({
  selector: 'app-control-aceite-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectModule, TableModule, TooltipModule, ModalUserCreateComponent, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './control-aceite-tab.component.html',
  styleUrl: './control-aceite-tab.component.scss',
})
export default class ControlAceiteTabComponent implements OnInit {
  public sucursales: Sucursal[] = [];
  public sucursalesSel: Sucursal[] = [];
  public loading: boolean = false;
  mostrarModalUsuario: boolean = false;
  actualizar: boolean = false;
  catusuarios: Usuario[] = [];
  usuariosel: Usuario | undefined;
  roles: Rol[] = [];
  usuarioSeleccionado: Usuario | any = new Usuario;
  esNuevoUsuario: boolean = false;
  subscripcionUsuarios: Subscription | undefined;
  private unsubscribe!: () => void;
  constructor(
    public documentsService: DocumentsService,
    private messageService: MessageService,
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private usersService: UsersService,
    private rolesService: RolesService,
    private branchesService: BranchesService
  ) { }
  ngOnInit(): void {
    this.obtenerSucursales();
    this.obtenerUsuarios();
    this.obtenerRoles();
  }

  async obtenerSucursales() {

    this.loading = true;
    try {
      this.sucursales = await this.branchesService.getOnce();
      for (let suc of this.sucursales) {
        if (suc.controlDeAceite == true) {
          this.sucursalesSel.push(suc);
        }
      }
      this.loading = false;
      this.cdr.detectChanges();
    } catch (error) {
    }
  }

  obtenerNombreRol(idRol: string): string {
    let name = '';
    let rol = this.roles.filter((x) => x.id == idRol);
    if (rol.length > 0) {
      name = rol[0].nombre;
    }
    return name;
  }

  abrirModalCrearUsuario() {
    this.esNuevoUsuario = true;
    this.mostrarModalUsuario = true;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerUsuarios() {
    this.usersService.usuarios$.subscribe(usuarios => this.catusuarios = usuarios.filter(x => x.idRol == '6'));
  }

  abrirModalEditarUsuario(usuario: Usuario) {
    this.esNuevoUsuario = false;
    this.usuarioSeleccionado = usuario;
    this.mostrarModalUsuario = true;
  }

  cerrarModalUsuario() {
    this.mostrarModalUsuario = false;
    this.usuarioSeleccionado = new Usuario;
  }

  obtenerRoles() {
    this.rolesService.get().subscribe({
      next: (data) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }


  async actualizarSucursales() {

    this.loading = true;
    let sucursales = [...this.sucursales];
    for (let suc of sucursales) {
      suc.controlDeAceite = false;
    }
    await this.branchesService.updateMultiple(sucursales);

    for (let suc of this.sucursalesSel) {
      suc.controlDeAceite = true;
    }
    await this.branchesService.updateMultiple(sucursales);

    this.obtenerSucursales();

    this.showMessage('success', 'Success', 'Enviado correctamente');
    this.loading = false;
  }

}
