import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { Rol } from '../../../models/rol.model';
import { Usuario } from '../../../models/usuario.model';
import { Sucursal } from '../../../models/sucursal.model';
import { UsersService } from '../../../services/users.service';
import { DocumentsService } from '../../../services/documents.service';
import { ModalUserCreateComponent } from '../../../modals/users/modal-user-create/modal-user-create.component';
import { RolesService } from '../../../services/roles.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TableModule,
    TooltipModule,
    ModalUserCreateComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.component.html',
})
export default class UsersComponent implements OnDestroy, OnInit {
  foundData: boolean = true;
  loading: boolean = true;
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
    private rolesService: RolesService
  ) {
  }


  ngOnInit(): void {
    this.obtenerUsuarios();
    this.obtenerRoles();
  }

  ngOnDestroy() {
    if (this.subscripcionUsuarios != undefined) {
      this.subscripcionUsuarios.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  abrirModalCrearUsuario() {
    this.esNuevoUsuario = true;
    this.mostrarModalUsuario = true;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerUsuarios() {
    this.subscripcionUsuarios = this.usersService.get().subscribe({
      next: (data) => {
        console.log(data);
        this.catusuarios = data;
        this.loading = false;
        if (data.length == 0) {
          this.foundData = false;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerNombreRol(idRol: string): string {
    let name = '';
    let rol = this.roles.filter((x) => x.id == idRol);
    if (rol.length > 0) {
      name = rol[0].nombre;
    }
    return name;
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
        this.eliminarUsuario(id);
      },
      reject: () => { },
    });
  }

  abrirModalEditarUsuario(usuario: Usuario) {
    this.esNuevoUsuario = false;
    this.usuarioSeleccionado = usuario;
    this.mostrarModalUsuario = true;
  }

  updateData() {
    // const data: Usuario = {
    //   id: this.usuariosel!.id,
    //   nombre: this.formnombre!,
    //   apellidoP: this.formapellidop!,
    //   apellidoM: this.formapellidom!,
    //   idRol: this.formrolsel!,
    //   email: this.formemail!,
    //   password: this.formpass!,
    //   uid: this.usuariosel?.uid!,
    //   sucursales: this.sucursalessel,
    //   esGuardia: false
    // };

    // this.documentsService
    //   .updateDoc('usuarios', data)
    //   .then(() => {
    //     this.showMessage('success', 'Success', 'Enviado correctamente');
    //     this.modalAgregar = false;
    //     this.actualizar = false;
    //     this.usuariosel = undefined;

    //     this.formapellidom = '';
    //     this.formapellidop = '';
    //     this.formemail = '';
    //     this.formnombre = '';
    //     this.formpass = '';
    //     this.formrolsel = undefined;
    //   })
    //   .catch((error) =>
    //     console.error('Error al actualizar los comentarios:', error)
    //   );
  }

  async eliminarUsuario(idu: string) {
    await this.documentsService.deleteDocument('usuarios', idu);
    this.showMessage('success', 'Success', 'Eliminado correctamente');
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

  cerrarModalUsuario() {
    this.mostrarModalUsuario = false; 
    this.usuarioSeleccionado = new Usuario;
  }
}
