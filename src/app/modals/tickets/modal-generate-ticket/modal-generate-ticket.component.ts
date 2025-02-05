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
import { Ticket } from '../../../models/ticket.model';
import { Notificacion } from '../../../models/notificacion.model';
import { MessageService } from 'primeng/api';
import { NotificationsService } from '../../../services/notifications.service';
import { UsuarioDB } from '../../../models/usuario-db.model';
import { DialogModule } from 'primeng/dialog';
import { Sucursal } from '../../../models/sucursal.model';
import { Usuario } from '../../../models/usuario.model';
import { DropdownModule } from 'primeng/dropdown';
import { CatalogosService } from '../../../services/catalogs.service';
import { Proveedor } from '../../../models/proveedor.model';
import { FormsModule } from '@angular/forms';
import { Categoria } from '../../../models/categoria.mdoel';
import { EditorModule } from 'primeng/editor';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';

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
  userdata: Usuario = new Usuario();
  proveedores: Proveedor[] = [];
  categorias: Categoria[] = [];

  formDepartamento: any;
  formProveedor: any;
  formCategoria: any;
  formDescripcion: string = '';
  formNombreSolicitante: any;
  formPrioridad: any;
  formStatusSucursal: any;
  catusuarioshelp: UsuarioDB[] = [];

  constructor(
    private ticketsService: TicketsService,
    private folioGeneratorService: FolioGeneratorService,
    private messageService: MessageService,
    private notificationsService: NotificationsService,
    private catalogosService: CatalogosService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.obtenerDepartamentos();
    this.obtenerProveedores();
    this.obtenerCategorias();
    this.obtenerUsuariosHelp();

    this.sucursal = this.userdata.sucursales[0];
    this.formDepartamento = this.sucursal;
  }

  obtenerDepartamentos() {
    this.catalogosService.getSucursalesDepto().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerProveedores() {
    this.catalogosService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  changeProveedor() {
    this.formCategoria = undefined;
    this.cdr.detectChanges();
  }

  obtenerCategorias() {
    this.catalogosService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerCategoriasProveedor(): Categoria[] {
    let arr: Categoria[] = [];
    if (this.formProveedor != undefined) {
      arr = this.categorias.filter((x) => x.idprov == this.formProveedor.id);
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

  async enviarTicket(): Promise<void> {
    this.ticketsService.obtenerSecuencialTickets().then(async (count) => {
      let folio = this.folioGeneratorService.generarFolio(
        this.formDepartamento.id,
        count
      );

      let idu = this.userdata.uid;
      let comtk: any[] = [];
      let tk: Ticket = {
        fecha: new Date(),
        idsucordpto: this.formDepartamento.id,
        statusSuc: null,
        idproveedor: this.formProveedor.id,
        idcategoria: this.formCategoria.id,
        decripcion: this.formDescripcion,
        solicitante: this.formNombreSolicitante,
        prioridadsuc: this.formPrioridad.name,
        prioridadProv: null,
        status: '1',
        responsable: this.obtenerResponsableTicket(),
        comentarios: comtk,
        fechafin: null,
        duracion: null,
        tiposoporte: null,
        iduser: idu,
        nombreCategoria: this.formCategoria.nombre,
        folio,
      };

      
      const docid = await this.ticketsService.addticket(tk);
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
        idtk: docid,
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
    for (let item of this.catusuarioshelp) {
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
        this.catusuarioshelp = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }
}
