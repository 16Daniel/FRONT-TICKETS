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

import { Ticket } from '../../../tickets/interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Categoria } from '../../../tickets/interfaces/categoria.mdoel';
import { PrioridadTicket } from '../../../tickets/interfaces/prioridad-ticket.model';
import { Area } from '../../../areas/interfaces/area.model';
import { TicketsService } from '../../../tickets/services/tickets.service';
import { FolioGeneratorService } from '../../../tickets/services/folio-generator.service';
import { CategoriesService } from '../../../tickets/services/categories.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { AreasService } from '../../../areas/services/areas.service';
import { TicketsPriorityService } from '../../../tickets/services/tickets-priority.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { ActivoFijo } from '../../interfaces/activo-fijo.interface';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { ParticipanteChat } from '../../../shared/interfaces/participante-chat.model';
import { SelectorArbolCategoriaComponent } from '../../../tickets/components/selector-arbol-categoria/selector-arbol-categoria.component';
import { SeleccionArbolCategoria } from '../../../tickets/interfaces/seleccion-arbol-categoria.interface';

@Component({
  selector: 'app-modal-fa-generate-ticket',
  standalone: true,
  imports: [
    DialogModule,
    DropdownModule,
    FormsModule,
    CommonModule,
    EditorModule,
    SelectorArbolCategoriaComponent
  ],
  providers: [MessageService],
  templateUrl: './modal-fa-generate-ticket.component.html',
  styleUrl: './modal-fa-generate-ticket.component.scss'
})
export class ModalFaGenerateTicketComponent implements OnInit {
  @Input() mostrarModalGenerateTicket: boolean = false;
  @Input() activoFijo: ActivoFijo = new ActivoFijo();
  @Output() closeEvent = new EventEmitter<boolean>();

  ticket: Ticket = new Ticket();
  sucursales: Sucursal[] = [];
  usuarioActivo?: Usuario | null;
  areas: Area[] = [];
  categorias: Categoria[] = [];
  prioridadesTicket: PrioridadTicket[] = [];
  formCategoria: any = null;
  catUsuariosHelp: Usuario[] = [];

  urlsArchivos: string[] = [];
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
  ) {}

  async ngOnInit(): Promise<void> {
    this.areas = this.areasService.areas;
    const areaEncontrada = this.areas.find(x => String(x.id) === String(this.activoFijo.idArea));
    if (areaEncontrada) {
      this.ticket.idArea = areaEncontrada.id;
    }

    this.usersService.usuarios$.subscribe(usuarios => {
      const usuarioEncontrado = usuarios.find(usuario =>
        usuario.idRol === '2' &&
        usuario.sucursales?.some(s => String(s.id) === String(this.activoFijo.idSucursal))
      );
      this.usuarioActivo = usuarioEncontrado || null;
    });

    this.ticket.referenciaActivoFijo = this.activoFijo.referencia;
    this.obtenerSucursales();
    this.obtenerCategorias();
    this.obtenerUsuariosHelp();
    this.obtenerPrioridadesTicket();
  }

  obtenerSucursales(): void {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.ticket.idSucursal = this.activoFijo.idSucursal;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerPrioridadesTicket(): void {
    this.ticketsPriorityService.get().subscribe({
      next: (data) => {
        this.prioridadesTicket = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerCategorias(): void {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    const val = value?.toUpperCase() || '';
    if (val === 'ALTA' || val === 'PÁNICO') return '#d3152a';
    if (val === 'MEDIA') return '#fdb813';
    if (val === 'BAJA') return '#16a34a';
    return '#64748b';
  }

  /* Selección de Categoría desde el Árbol */
  onSeleccionarCategoria(seleccion: SeleccionArbolCategoria): void {
    this.formCategoria = seleccion.categoria;
    this.ticket.idCategoria = seleccion.idCategoria;
    this.ticket.nombreCategoria = seleccion.nombreCategoria;
    this.ticket.idSubcategoria = seleccion.idSubcategoria || null;
    this.ticket.nombreSubcategoria = seleccion.nombreSubcategoria || '';

    // Urgencia (3×3)
    const critUrg = seleccion.criticidad || seleccion.subcategoria?.criticidad || seleccion.categoria?.criticidad || 2;
    const urgUrg = seleccion.urgencia || seleccion.subcategoria?.urgencia || seleccion.categoria?.urgencia || 2;
    const scoreUrg = seleccion.score || (critUrg * urgUrg);
    const prioUrg = seleccion.prioridad || seleccion.subcategoria?.prioridad || seleccion.categoria?.prioridad || 'Medio';

    this.ticket.criticidad = Math.min(3, Math.max(1, critUrg));
    this.ticket.urgencia = Math.min(3, Math.max(1, urgUrg));
    this.ticket.score = scoreUrg;
    this.ticket.prioridad = prioUrg as any;
    this.ticket.tiempoResolucion = seleccion.tiempoResolucion;
    this.ticket.unidadResolucion = seleccion.unidadResolucion;
    this.ticket.horasResolucion = seleccion.horasResolucion;
  }

  onLimpiarCategoria(): void {
    this.formCategoria = null;
    this.ticket.idCategoria = '';
    this.ticket.nombreCategoria = '';
    this.ticket.idSubcategoria = null;
    this.ticket.nombreSubcategoria = '';
    this.ticket.criticidad = undefined;
    this.ticket.urgencia = undefined;
    this.ticket.score = undefined;
    this.ticket.prioridad = undefined;
    this.ticket.tiempoResolucion = undefined;
    this.ticket.unidadResolucion = undefined;
    this.ticket.horasResolucion = undefined;
  }

  async enviarTicket(form: NgForm): Promise<void> {
    if (form.form.status === 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });
      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    if (!this.ticket.idCategoria) {
      this.showMessage('error', 'Categoría requerida', 'Por favor selecciona una categoría del árbol');
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

    const count = await this.ticketsService.obtenerSecuencialTickets();
    const folio = this.folioGeneratorService.generarFolio(
      parseInt(String(this.ticket.idSucursal), 10),
      count
    );

    const idsResponsablesTicket = this.obtenerResponsablesTicket(
      String(this.ticket.idSucursal),
      String(this.ticket.idArea)
    );
    if (idsResponsablesTicket.length === 0) {
      Swal.close();
      this.showMessage('error', 'Error', 'No hay analistas disponibles para el área seleccionada');
      return;
    }

    const participantesChat: ParticipanteChat[] = [];
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

    this.ticket.idInvolucrados = idsResponsablesTicket;
    this.ticket.idSucursal = this.ticket.idSucursal.toString();
    this.ticket.idArea = this.ticket.idArea.toString();
    this.ticket.idCategoria = this.ticket.idCategoria.toString();
    this.ticket.idSubcategoria = this.ticket.idSubcategoria ? this.ticket.idSubcategoria.toString() : null;
    this.ticket.idResponsable = this.obtenerIdResponsableTicket();
    this.ticket.idTipoSoporte = this.obtenerTipoSoporte(this.ticket.idArea);
    this.ticket.idUsuario = this.usuarioActivo?.id;
    this.ticket.folio = folio;
    

    if (this.archivos.length > 0) {
      this.firebaseStorage.cargarImagenesEvidenciasTicket(this.archivos)
        .then(async urls => {
          this.ticket.archivos = urls;
          await this.ticketsService.create({ ...this.ticket });
          await this.ticketsService.incrementarContadorTickets();
          Swal.close();
          Swal.fire('OK', 'TICKET CREADO!', 'success');
          this.closeEvent.emit();
        })
        .catch(async err => {
          console.error('Error al subir una o más imágenes:', err);
          this.showMessage('warn', 'Warning', 'Error al subir una o más imágenes');
          await this.ticketsService.incrementarContadorTickets();
          await this.ticketsService.create({ ...this.ticket });
          Swal.close();
          Swal.fire('OK', 'TICKET CREADO!', 'success');
          this.closeEvent.emit();
        });
    } else {
      this.ticket.archivos = [];
      await this.ticketsService.create({ ...this.ticket });
      await this.ticketsService.incrementarContadorTickets();
      Swal.close();
      Swal.fire('OK', 'TICKET CREADO!', 'success');
      this.closeEvent.emit();
    }
  }

  obtenerTipoSoporte(idArea: string): string {
    if (idArea === '1') return '2';
    return '1';
  }

  obtenerIdResponsableTicket(): string {
    let id = '';
    const usuarioResponsable = this.catUsuariosHelp.find(x => 
      x.idRol === '4' && 
      String(x.idArea) === String(this.ticket.idArea) &&
      x.sucursales && x.sucursales.some(s => String(s.id) === String(this.ticket.idSucursal))
    );
    
    if (usuarioResponsable) {
      id = usuarioResponsable.id;
    }
    return id;
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerUsuariosHelp = (): void => {
    this.usersService.usuarios$.subscribe(usuarios => this.catUsuariosHelp = usuarios);
  };

  onHide = (): void => this.closeEvent.emit(false);

  obtenerResponsablesTicket(idSucursal: string, idArea: string): string[] {
    const idsResponsables: string[] = [];
    for (const usuario of this.catUsuariosHelp) {
      const esRol4 = String(usuario.idRol) === '4';
      const esMismaArea = String(usuario.idArea) === String(idArea);
      const tieneSucursal = usuario.sucursales && usuario.sucursales.some(s => String(s.id) === String(idSucursal));
      const esGuardia = usuario.esGuardia === true;

      if (esRol4 && esMismaArea && (tieneSucursal || esGuardia)) {
        idsResponsables.push(usuario.id);
      }
    }
    return idsResponsables;
  }

  onSeleccionarImagenes(): void {
    const fileInput = document.getElementById('fileInputFA') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileChange(event: Event): void {
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
