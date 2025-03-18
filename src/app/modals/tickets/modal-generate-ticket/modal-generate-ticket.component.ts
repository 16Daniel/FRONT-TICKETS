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
import { FormsModule, NgForm } from '@angular/forms';
import { Categoria } from '../../../models/categoria.mdoel';
import { EditorModule } from 'primeng/editor';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import { Ticket } from '../../../models/ticket.model';
import { BranchesService } from '../../../services/branches.service';
import { CategoriesService } from '../../../services/categories.service';
import { AreasService } from '../../../services/areas.service';
import { Area } from '../../../models/area';
import { TicketsPriorityService } from '../../../services/tickets-priority.service';
import { PrioridadTicket } from '../../../models/prioridad-ticket.model';

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
  sucursal: Sucursal | any;
  usuarioActivo: Usuario = new Usuario();
  areas: Area[] = [];
  categorias: Categoria[] = [];
  prioridadesTicket: PrioridadTicket[] = [];

  formDepartamento: any;
  formArea: any;
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
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private areasService: AreasService,
    private ticketsPriorityService: TicketsPriorityService
  ) {}

  ngOnInit(): void {
    this.usuarioActivo = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.obtenerSucursales();
    this.obtenerAreas();
    this.obtenerCategorias();
    this.obtenerUsuariosHelp();
    this.obtenerPrioridadesTicket();
    this.sucursal = this.usuarioActivo.sucursales[0];
    this.formDepartamento = this.sucursal;
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
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
    this.areasService.get().subscribe({
      next: (data) => {
        this.areas = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerPrioridadesTicket() {
    this.ticketsPriorityService.get().subscribe({
      next: (data) => {
        this.prioridadesTicket = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  onChangeArea() {
    this.formCategoria = undefined;
    this.cdr.detectChanges();
  }

  obtenerCategorias() {
    this.categoriesService.get().subscribe({
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
    if (this.formArea != undefined) {
      arr = this.categorias.filter((x) => x.idArea == this.formArea.id);
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
        parseInt(this.sucursal?.id),
        count
      );

      const fechaEstimacion = new Date(); // Obtiene la fecha actual
      fechaEstimacion.setDate(fechaEstimacion.getDate() + 5);

      let tk: Ticket = {
        fecha: new Date(),
        idSucursal: this.sucursal.id,
        idArea: this.formArea.id,
        idCategoria: this.formCategoria.id,
        decripcion: this.formDescripcion,
        solicitante: this.formNombreSolicitante,
        idPrioridadTicket: this.formPrioridad.id,
        idEstatusTicket: '1',
        responsable: this.obtenerUidResponsableTicket(),
        comentarios: [],
        fechaFin: null,
        fechaEstimacion,
        idTipoSoporte: '1',
        idUsuario: this.usuarioActivo.uid,
        nombreCategoria: this.formCategoria.nombre,
        folio,
        calificacion: 0,
        participantesChat: [
          {
            idUsuario: this.usuarioActivo.id,
            ultimoComentarioLeido: 0,
          },
          {
            idUsuario: this.obtenerIdResponsableTicket(),
            ultimoComentarioLeido: 0,
          },
        ],
      };

      const docid = await this.ticketsService.create(tk);
      this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');
      console.log('Success', 'ENVIADO CORRECTAMENTE')
      this.closeEvent.emit(false); // Cerrar modal
    });
  }

  obtenerUidResponsableTicket(): string {
    let idr = '';
    for (let item of this.catUsuariosHelp) {
      if (item.idRol == '4') {
        const existeSucursal = item.sucursales.some(
          (x) => x.id == this.sucursal.id
        );
        if (existeSucursal) {
          idr = item.uid;
        }
      }
    }

    return idr;
  }

  obtenerIdResponsableTicket(): string {
    let id = '';
    for (let item of this.catUsuariosHelp) {
      if (item.idRol == '4') {
        const existeSucursal = item.sucursales.some(
          (x) => x.id == this.sucursal.id
        );
        if (existeSucursal) {
          id = item.id;
        }
      }
    }

    return id;
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
