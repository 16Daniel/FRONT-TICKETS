import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { Component, ChangeDetectorRef, destroyPlatform } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { PrimeNGConfig } from 'primeng/api';
import { ConfirmationService, ConfirmEventType } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Rol } from '../../models/rol.model';
import { Ruta } from '../../models/ruta.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { Usuario } from '../../models/usuario.model';
import { Sucursal } from '../../models/sucursal.model';
import { UsuarioDB } from '../../models/usuario-db.model';
import { UsersService } from '../../services/users.service';
import { CatalogosService } from '../../services/catalogs.service';
import { DocumentsService } from '../../services/documents.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonModule,
    DialogModule,
    ToastModule,
    CalendarModule,
    FormsModule,
    ConfirmDialogModule,
    MultiSelectModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.component.html',
})
export default class UsersComponent {
  public foundData: boolean = true;
  public loading: boolean = true;
  public modalAgregar: boolean = false;
  public actualizar: boolean = false;
  public catusuarios: UsuarioDB[] = [];
  public usuariosel: UsuarioDB | undefined;
  public catroles: Rol[] = [];
  public formrolsel: string | undefined;
  public formnombre: string | undefined;
  public formapellidop: string | undefined;
  public formapellidom: string | undefined;
  public formemail: string | undefined;
  public formpass: string | undefined;
  public catsucursales: Sucursal[] = [];
  public sucursalessel: Sucursal[] = [];

  constructor(
    public documentsService: DocumentsService,
    private messageService: MessageService,
    public cdr: ChangeDetectorRef,
    private config: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private usersService: UsersService,
    private catalogosService: CatalogosService
  ) {
    this.getRoles();
    this.getusuarios();
    this.getDepartamentos();
  }
  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
  ngOnInit(): void {}

  showAgregar() {
    this.actualizar = false;
    this.modalAgregar = true;
  }

  getusuarios() {
    this.usersService.getusers().subscribe({
      next: (data) => {
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

  getRoles() {
    this.catalogosService.getRoles().subscribe({
      next: (data) => {
        this.catroles = data;
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

  getrolname(idr: string): string {
    let name = '';
    let rol = this.catroles.filter((x) => x.id == idr);
    if (rol.length > 0) {
      name = rol[0].nombre;
    }
    return name;
  }

  confirm(id: string) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.deleteUser(id);
      },
      reject: () => {},
    });
  }

  showEdit(data: UsuarioDB) {
    this.actualizar = true;
    this.modalAgregar = true;
    this.usuariosel = data;

    this.formnombre = data.nombre;
    this.formapellidop = data.apellidoP;
    this.formapellidom = data.apellidoM;
    this.formemail = data.email;
    this.formpass = data.password;
    this.formrolsel = data.idRol;
    this.sucursalessel = [];
    this.sucursalessel = data.sucursales;
  }

  async adduser() {
    try {
      debugger;
      const uid = await this.usersService.registerUser(
        this.formemail!,
        this.formpass!
      );
      if (uid != null) {
        this.saveData(uid);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  }

  async saveData(uid: string) {
    const data: Usuario = {
      nombre: this.formnombre!,
      apellidoP: this.formapellidop!,
      apellidoM: this.formapellidom!,
      idRol: this.formrolsel!,
      email: this.formemail!,
      password: this.formpass!,
      uid: uid,
      sucursales: this.sucursalessel,
    };

    try {
      await this.usersService.addUser(data);
      console.log('Usuario agregado a Firestore');
    } catch (error) {
      console.error('Error al agregar usuario:', error);
    }

    this.modalAgregar = false;
    this.formnombre = undefined;
    this.formapellidop = undefined;
    this.formapellidom = undefined;
    this.formrolsel = undefined;
    this.formemail = undefined;
    this.formpass = undefined;

    this.cdr.detectChanges();
    this.getusuarios();
    this.showMessage('success', 'Success', 'Guardado correctamente');
  }

  updateData() {
    const data: UsuarioDB = {
      id: this.usuariosel!.id,
      nombre: this.formnombre!,
      apellidoP: this.formapellidop!,
      apellidoM: this.formapellidom!,
      idRol: this.formrolsel!,
      email: this.formemail!,
      password: this.formpass!,
      uid: this.usuariosel?.uid!,
      sucursales: this.sucursalessel,
    };

    this.documentsService
      .updateDoc('usuarios', data)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');
        this.modalAgregar = false;
        this.actualizar = false;
        this.usuariosel = undefined;

        this.formapellidom = '';
        this.formapellidop = '';
        this.formemail = '';
        this.formnombre = '';
        this.formpass = '';
        this.formrolsel = undefined;
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  async deleteUser(idu: string) {
    await this.documentsService.deleteDocument('usuarios', idu);
    this.showMessage('success', 'Success', 'Eliminado correctamente');
  }

  getDepartamentos() {
    this.catalogosService.getSucursalesDepto().subscribe({
      next: (data) => {
        this.catsucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }
}
