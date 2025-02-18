import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TicketsService } from '../../../services/tickets.service';
import { FolioGeneratorService } from '../../../services/folio-generator.service';
import { MessageService } from 'primeng/api';
import { NotificationsService } from '../../../services/notifications.service';
import { DialogModule } from 'primeng/dialog';
import { Sucursal } from '../../../models/sucursal.model';
import { Usuario } from '../../../models/usuario.model';
import { DropdownModule } from 'primeng/dropdown';
import { CatalogosService } from '../../../services/catalogs.service';
import { Proveedor } from '../../../models/proveedor.model';
import { FormsModule, NgForm } from '@angular/forms';
import { Categoria } from '../../../models/categoria.mdoel';
import { EditorModule } from 'primeng/editor';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import { Notificacion } from '../../../models/notificacion.model';
import { Ticket } from '../../../models/ticket.model';
import { SucursalesService } from '../../../services/sucursales.service';
import { CategoriasService } from '../../../services/categorias.service';

@Component({
  selector: 'app-modal-generate-ticket',
  standalone: true,
  imports: [
    DialogModule,
    DropdownModule,
    FormsModule,
    CommonModule,
    EditorModule,
  ],
  templateUrl: './modal-generate-ticket.component.html',
  styleUrl: './modal-generate-ticket.component.scss',
})
export class ModalGenerateTicketComponent implements OnInit {
  @Input() showModalGenerateTicket: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  sucursales: Sucursal[] = [];
  sucursal: Sucursal | undefined;
  usuarioActivo: Usuario = new Usuario();
  areas: Proveedor[] = [];
  categorias: Categoria[] = [];

  formDepartamento: any;
  formProveedor: any;
  formCategoria: any;
  formDescripcion: string = '';
  formNombreSolicitante: any;
  formPrioridad: any;
  formStatusSucursal: any;
  catUsuariosHelp: Usuario[] = [];

  constructor(
    private ticketsService: TicketsService,
    private folioGeneratorService: FolioGeneratorService,
    private messageService: MessageService,
    private notificationsService: NotificationsService,
    private catalogosService: CatalogosService,
    private categoriasService: CategoriasService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private sucursalesServices: SucursalesService
  ) {}

  ngOnInit(): void {
    this.usuarioActivo = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.obtenerSucursales();
    this.obtenerAreas();
    this.obtenerCategorias();
    this.obtenerUsuariosHelp();

    this.sucursal = this.usuarioActivo.sucursales[0];
    this.formDepartamento = this.sucursal;
  }

  obtenerSucursales() {
    this.sucursalesServices.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerAreas() {
    this.catalogosService.getProveedores().subscribe({
      next: (data) => {
        this.areas = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  onChangeArea() {
    this.formCategoria = undefined;
    this.cdr.detectChanges();
  }

  obtenerCategorias() {
    this.categoriasService.get().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerCategoriasPorArea(): Categoria[] {
    let arr: Categoria[] = [];
    if (this.formProveedor != undefined) {
      arr = this.categorias.filter((x) => x.idProveedor == this.formProveedor.id);
    }
    return arr;
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    let str = '';

    if (value == 'ALTA') {
      str = '#ff0000';
    }

    if (value == 'MEDIA') {
      str = '#ffe800';
    }

    if (value == 'BAJA') {
      str = '#61ff00';
    }
    return str;
  }

  async enviarTicket(form: NgForm): Promise<void> {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    this.ticketsService.obtenerSecuencialTickets().then(async (count) => {
      let folio = this.folioGeneratorService.generarFolio(
        this.formDepartamento.id,
        count
      );

      let tk: Ticket = {
        fecha: new Date(),
        idSucursal: this.formDepartamento.id,
        estatusSucursal: this.formPrioridad.name === 'PÁNICO' ? 'PÁNICO' : null,
        idProveedor: this.formProveedor.id,
        idCategoria: this.formCategoria.id,
        decripcion: this.formDescripcion,
        solicitante: this.formNombreSolicitante,
        prioridadSucursal: this.formPrioridad.name,
        prioridadProveedor: null,
        estatus: 1,
        responsable: this.obtenerResponsableTicket(),
        comentarios: [],
        fechaFin: null,
        duracion: null,
        tipoSoporte: null,
        idUsuario: this.usuarioActivo.uid,
        nombreCategoria: this.formCategoria.nombre,
        folio,
        calificacion: 0,
      };

      const docid = await this.ticketsService.create(tk);
      this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');
      this.closeEvent.emit(false); // Cerrar modal

      let dataNot: Notificacion = {
        titulo: 'NUEVO TICKET',
        mensaje:
          'SE GENERÓ UN NUEVO TICKET PARA LA SUCURSAL: ' +
          this.formDepartamento.nombre,
        uid: this.obtenerResponsableTicket(),
        fecha: new Date(),
        abierta: false,
        idTicket: docid,
        notificado: false,
      };

      this.notificationsService.addNotifiacion(dataNot);

      this.formDescripcion = '';
      this.formNombreSolicitante = '';
      this.formCategoria = undefined;
      this.formStatusSucursal = undefined;
      this.formProveedor = undefined;
      this.formPrioridad = undefined;
    });
  }

  obtenerResponsableTicket(): string {
    let idr = '';
    for (let item of this.catUsuariosHelp) {
      if (item.idRol == '4') {
        const existeSucursal = item.sucursales.some(
          (x) => x.id == this.formDepartamento.id
        );
        if (existeSucursal) {
          idr = item.uid;
        }
      }
    }

    return idr;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerUsuariosHelp() {
    this.usersService.getusers().subscribe({
      next: (data) => {
        this.catUsuariosHelp = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }
}
