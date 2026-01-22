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
import Swal from 'sweetalert2';

import { Ticket } from '../../../tickets/models/ticket.model';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { Categoria } from '../../../tickets/models/categoria.mdoel';
import { PrioridadTicket } from '../../../tickets/models/prioridad-ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { FolioGeneratorService } from '../../../tickets/services/folio-generator.service';
import { CategoriesService } from '../../../tickets/services/categories.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { AreasService } from '../../../areas/services/areas.service';
import { TicketsPriorityService } from '../../../tickets/services/tickets-priority.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { Subcategoria } from '../../../tickets/models/subcategoria.model';
import { ActivoFijo } from '../../interfaces/activo-fijo.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { ParticipanteChat } from '../../../shared/interfaces/participante-chat.model';

@Component({
  selector: 'app-modal-fa-generate-ticket',
  standalone: true,
  imports: [
    DialogModule,
    DropdownModule,
    FormsModule,
    CommonModule,
    EditorModule,
  ],
  templateUrl: './modal-fa-generate-ticket.component.html',
  styleUrl: './modal-fa-generate-ticket.component.scss'
})

export class ModalFaGenerateTicketComponent implements OnInit {
  @Input() mostrarModalGenerateTicket: boolean = false;
  @Input() activoFijo: ActivoFijo = new ActivoFijo;
  @Output() closeEvent = new EventEmitter<boolean>();

  ticket: Ticket = new Ticket
  sucursales: Sucursal[] = [];
  usuarioActivo?: Usuario | null;
  areas: Area[] = [];
  categorias: Categoria[] = [];
  prioridadesTicket: PrioridadTicket[] = [];
  mostrarCampoSubcategoria = false;
  formCategoria: any;
  catUsuariosHelp: Usuario[] = [];

  imagenesEvidencia: string[] = [];
  imagenesBase64: string[] = [];
  archivos: File[] = [];

  constructor(
    private ticketsService: TicketsService,
    private folioGeneratorService: FolioGeneratorService,
    private messageService: MessageService,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private areasService: AreasService,
    private ticketsPriorityService: TicketsPriorityService,
    private firebaseStorage: FirebaseStorageService
  ) { }

  async ngOnInit(): Promise<void> {
    this.areas = this.areasService.areas;
    this.ticket.idArea = this.areas.find(x => x.id == this.activoFijo.idArea)!.id;

    this.usersService.usuarios$.subscribe(usuarios => {
      const usuarioEncontrado = usuarios.find(usuario =>
        usuario.idRol === '2' &&
        usuario.sucursales?.some(s => s.id == this.activoFijo.idSucursal)
      );

      this.usuarioActivo = usuarioEncontrado || null;
    });

    this.ticket.referenciaActivoFijo = this.activoFijo.referencia;
    this.obtenerSucursales();
    this.obtenerCategorias();
    this.obtenerUsuariosHelp();
    this.obtenerPrioridadesTicket();
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.ticket.idSucursal = this.activoFijo.idSucursal;
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

    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...',
      didOpen: () => Swal.showLoading(),
      customClass: {
        container: 'swal-topmost'
      }
    });

    let count = await this.ticketsService.obtenerSecuencialTickets();
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
      idUsuario: this.usuarioActivo?.id,
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
    this.ticket.idArea = this.ticket.idArea.toString();
    this.ticket.idCategoria = this.ticket.idCategoria.toString();
    this.ticket.idResponsableFinaliza = this.obtenerIdResponsableTicket();
    this.ticket.fechaEstimacion = fechaEstimacion;
    this.ticket.idTipoSoporte = this.obtenerTipoSoporte(this.ticket.idArea);
    this.ticket.idUsuario = this.usuarioActivo?.id;
    this.ticket.nombreCategoria = this.formCategoria.nombre;

    if (this.formCategoria.activarSubcategorias)
      this.ticket.nombreSubcategoria = this.formCategoria.subcategorias.find((x: Subcategoria) => x.id == this.ticket.idSubcategoria).nombre

    this.ticket.folio = folio;
    this.ticket.participantesChat = participantesChat;

    this.firebaseStorage.cargarImagenesEvidenciasTicket(this.archivos)
      .then(async urls => {
        this.ticket.imagenesEvidencia = urls;
        await this.ticketsService.create({ ...this.ticket });
        Swal.close();
        // this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');
        await this.ticketsService.incrementarContadorTickets();

        Swal.fire("OK", "TICKET CREADO!", "success");
        this.closeEvent.emit();
      })
      .catch(async err => {
        console.error('Error al subir una o más imágenes:', err);
        this.showMessage('warn', 'Warning', 'Error al subir una o más imágenes');
        await this.ticketsService.incrementarContadorTickets();

        await this.ticketsService.create({ ...this.ticket });
        Swal.fire("OK", "TICKET CREADO!", "success");
        this.closeEvent.emit();
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
        if (existeSucursal && item.idArea == this.ticket.idArea) {
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
    this.usersService.usuarios$.subscribe(usuarios => this.catUsuariosHelp = usuarios);
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

  onSeleccionarImagenes() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.archivos = Array.from(input.files);

    this.imagenesBase64 = [];

    this.archivos.forEach(file => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.imagenesBase64.push(reader.result);
          this.cdr.detectChanges();
        }
      };

      reader.readAsDataURL(file);
    });
  }

}
