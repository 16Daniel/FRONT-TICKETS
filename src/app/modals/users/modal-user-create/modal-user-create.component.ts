import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';

import { Usuario } from '../../../models/usuario.model';
import { Sucursal } from '../../../models/sucursal.model';
import { Rol } from '../../../models/rol.model';
import { UsersService } from '../../../services/users.service';
import { BranchesService } from '../../../services/branches.service';
import { RolesService } from '../../../services/roles.service';
import { DocumentsService } from '../../../services/documents.service';
import { Area } from '../../../models/area.model';
import { AreasService } from '../../../services/areas.service';

@Component({
  selector: 'app-modal-user-create',
  standalone: true,
  imports: [DialogModule, FormsModule, MultiSelectModule, CommonModule, DropdownModule],
  templateUrl: './modal-user-create.component.html',
  styleUrl: './modal-user-create.component.scss'
})

export class ModalUserCreateComponent implements OnInit {
  @Input() mostrarModalCrearUsuario: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() usuario: Usuario = new Usuario;
  @Input() esNuevoUsuario: boolean = true;

  sucursales: Sucursal[] = [];
  roles: Rol[] = [];
  areas: Area[] = [];

  constructor(
    private messageService: MessageService,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private rolesService: RolesService,
    private areasService: AreasService,
    private documentsService: DocumentsService,
  ) {
    this.usuario = this.usuario.idRol ? this.usuario : new Usuario;
  }

  ngOnInit(): void {
    this.obtenerSucursales();
    this.obtenerRoles();
    this.obtenerAreas();
  }

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    this.usuario.sucursales.forEach(sucursal => {
      delete sucursal.activoMantenimientos;
    });

    this.esNuevoUsuario ? this.guardarAutenticacionFb() : this.actualizarUsuario();
  }

  /**
 * Guarda al usuario en la autenticaciond e firebase
 * @returns 
 */
  async guardarAutenticacionFb() {
    try {
      const uid = await this.usersService.registerAuthFirebaseUser(
        this.usuario.email!,
        this.usuario.password!
      );
      if (uid != null) {
        this.guardarUsuario(uid);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  }

  /**
   * Guardar al usuario en la tabla de usuarios
   * @param uid 
   */
  async guardarUsuario(uid: string) {
    this.usuario.uid = uid;

    try {
      await this.usersService.create({ ...this.usuario });
    } catch (error) {
      console.error('Error al agregar usuario:', error);
    }

    this.cdr.detectChanges();
    this.closeEvent.emit(false); // Cerrar modal
    this.showMessage('success', 'Success', 'Guardado correctamente');
  }

  actualizarUsuario() {
    this.documentsService
      .updateDoc('usuarios', this.usuario)
      .then(() => {
        this.cdr.detectChanges();
        this.closeEvent.emit(false); // Cerrar modal
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;

        this.sucursales.forEach(sucursal => {
          delete sucursal.activoMantenimientos;
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
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

  obtenerAreas() {
    this.areasService.get().subscribe({
      next: (data) => {
        this.areas = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }
}
