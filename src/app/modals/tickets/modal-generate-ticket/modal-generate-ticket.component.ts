import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';

import { Sucursal } from '../../../models/sucursal.model';
import { Usuario } from '../../../models/usuario.model';
import { Categoria } from '../../../models/categoria.mdoel';
import { UsersService } from '../../../services/users.service';
import { Ticket } from '../../../models/ticket.model';
import { BranchesService } from '../../../services/branches.service';
import { CategoriesService } from '../../../services/categories.service';
import { AreasService } from '../../../services/areas.service';
import { Area } from '../../../models/area.model';
import { TicketsService } from '../../../services/tickets.service';
import { FolioGeneratorService } from '../../../services/folio-generator.service';
import { TicketsPriorityService } from '../../../services/tickets-priority.service';
import { PrioridadTicket } from '../../../models/prioridad-ticket.model';
import { ParticipanteChat } from '../../../models/participante-chat.model';
import { Subcategoria } from '../../../models/subcategoria.model';

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
  @Input() mostrarModalGenerateTicket: boolean = false;
  @Input() idArea: string = '0';
  @Output() closeEvent = new EventEmitter<boolean>();

  ticket: Ticket = new Ticket
  sucursales: Sucursal[] = [];
  // sucursal: Sucursal | any;
  usuarioActivo: Usuario = new Usuario();
  areas: Area[] = [];
  categorias: Categoria[] = [];
  prioridadesTicket: PrioridadTicket[] = [];
  isLoading = false;
  mostrarCampoSubcategoria = false;
  // formArea: any;
  formCategoria: any;
  // formDescripcion: string = '';
  // formNombreSolicitante: any;
  // formPrioridad: any;
  // formStatusSucursal: any;
  catUsuariosHelp: Usuario[] = [];

  constructor(
    private ticketsService: TicketsService,
    private folioGeneratorService: FolioGeneratorService,
    private messageService: MessageService,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private areasService: AreasService,
    private ticketsPriorityService: TicketsPriorityService
  ) { }

  ngOnInit(): void {
    this.usuarioActivo = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.obtenerSucursales();
    this.obtenerAreas();
    this.obtenerCategorias();
    this.obtenerUsuariosHelp();
    this.obtenerPrioridadesTicket();
    // this.ticket.idSucursal = this.usuarioActivo.sucursales[0].id;
    // this.formDepartamento = this.sucursal;
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.ticket.idSucursal = parseInt(this.usuarioActivo.sucursales[0].id);
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

        // this.formArea = this.areas.find(x => x.id == this.idArea);
        this.ticket.idArea = this.areas.find(x => x.id == this.idArea)!.id;

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
    this.ticket.idCategoria = '';
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
    if (this.ticket.idArea) {
      arr = this.categorias.filter((x) => x.idArea == this.ticket.idArea);
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

    this.isLoading = true;

    this.ticketsService.obtenerSecuencialTickets().then(async (count) => {
      let folio = this.folioGeneratorService.generarFolio(
        parseInt(this.ticket.idSucursal),
        count
      );

      const fechaEstimacion = new Date(); // Obtiene la fecha actual
      fechaEstimacion.setDate(fechaEstimacion.getDate() + 5);

      let idsResponsablesTicket = this.obtenerResponsablesTicket(this.ticket.idSucursal, this.ticket.idArea);
      if (idsResponsablesTicket.length == 0) {
        this.showMessage('error', 'Error', 'No hay analistas disponibles para el área seleccionada');
        return;
      }



      let participantesChat: ParticipanteChat[] = [];
      participantesChat.push({
        idUsuario: this.usuarioActivo.id,
        ultimoComentarioLeido: 0,
      });

      idsResponsablesTicket.forEach(id => {
        participantesChat.push({
          idUsuario: id,
          ultimoComentarioLeido: 0,
        });
      });

      this.ticket.idResponsables = idsResponsablesTicket;
      this.ticket.idSucursal = this.ticket.idSucursal.toString();
      this.ticket.idResponsableFinaliza = this.obtenerIdResponsableTicket();
      this.ticket.fechaEstimacion = fechaEstimacion;
      this.ticket.idTipoSoporte = this.obtenerTipoSoporte(this.ticket.idArea);
      this.ticket.idUsuario = this.usuarioActivo.id;
      this.ticket.nombreCategoria = this.formCategoria.nombre;

      if (this.formCategoria.activarSubcategorias)
        this.ticket.nombreSubcategoria = this.formCategoria.subcategorias.find((x: Subcategoria) => x.id == this.ticket.idSubcategoria).nombre

      this.ticket.folio = folio;
      this.ticket.participantesChat = participantesChat;

      await this.ticketsService.create({ ...this.ticket });
      this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');
      this.closeEvent.emit(false);
    });
  }

  obtenerTipoSoporte(idArea: string) {

    if (idArea == '1') return '2';
    else if (idArea == '2') return '1';
    else return '1';
  }

  obtenerIdResponsableTicket(): string {
    let id = '';
    for (let item of this.catUsuariosHelp) {
      if (item.idRol == '4') {
        const existeSucursal = item.sucursales.some(
          (x) => x.id == this.ticket.idSucursal
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
    this.usersService.get().subscribe({
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

  obtenerResponsablesTicket(idSucursal: string, idArea: string): string[] {
    let idsResponsables: string[] = [];

    for (let usuario of this.catUsuariosHelp) {
      const existeSucursal = usuario.sucursales.some(
        (sucursal) => sucursal.id == idSucursal
      );

      if (
        ((existeSucursal && usuario.idArea == idArea) || (usuario.esGuardia && usuario.idArea == this.ticket.idArea)) && usuario.idRol !== '2') {
        idsResponsables.push(usuario.id);
      }
    }

    return idsResponsables;
  }

  onCategoriaChange(categoria: Categoria) {
    this.ticket.idCategoria = categoria.id;
    this.ticket.idSubcategoria = null;
    this.mostrarCampoSubcategoria = categoria.activarSubcategorias;
  }

  obtenerSubcategoriasFiltradas = (): Subcategoria[] =>
    this.formCategoria.subcategorias.filter((x: Subcategoria) => x.eliminado == false)

}
