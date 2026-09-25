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

import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Categoria } from '../../interfaces/categoria.mdoel';
import { PrioridadTicket } from '../../interfaces/prioridad-ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { FolioGeneratorService } from '../../services/folio-generator.service';
import { CategoriesService } from '../../services/categories.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { AreasService } from '../../../areas/services/areas.service';
import { TicketsPriorityService } from '../../services/tickets-priority.service';
import { FixedAssetsService } from '../../../activos-fijos/services/fixed-assets.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { Subcategoria } from '../../interfaces/subcategoria.model';
import { ActivoFijo } from '../../../activos-fijos/interfaces/activo-fijo.interface';
import { ParticipanteChat } from '../../../shared/interfaces/participante-chat.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { SelectorArbolCategoriaComponent } from '../../components/selector-arbol-categoria/selector-arbol-categoria.component';
import { SeleccionArbolCategoria } from '../../interfaces/seleccion-arbol-categoria.interface';
import { FileUtils } from '../../../shared/utils/file.utils';
import { TaskResponsibleService } from '../../../tareas/services/task-responsible.service';

import Quill from 'quill';
import { Mention, MentionBlot } from 'quill-mention';
import { MentionUtils } from '../../../shared/utils/mention.utils';

Quill.register({ 'blots/mention': MentionBlot, 'modules/mention': Mention });

@Component({
  selector: 'app-crear-ticket-dialog',
  standalone: true,
  imports: [
    DialogModule,
    DropdownModule,
    FormsModule,
    CommonModule,
    EditorModule,
    SelectorArbolCategoriaComponent
  ],
  templateUrl: './crear-ticket-dialog.component.html',
  styleUrl: './crear-ticket-dialog.component.scss',
})
export class CrearTicketDialogComponent implements OnInit {
  @Input() mostrarModalGenerateTicket: boolean = false;
  @Input() idArea: string = '0';
  @Output() closeEvent = new EventEmitter<boolean>();

  ticket: Ticket = new Ticket();
  sucursales: Sucursal[] = [];
  usuarioActivo: Usuario = new Usuario();
  areas: Area[] = [];
  categorias: Categoria[] = [];
  prioridadesTicket: PrioridadTicket[] = [];
  formCategoria: any = null;
  catUsuariosHelp: Usuario[] = [];

  esActivoFijo: boolean = false;
  activoFijo: ActivoFijo | undefined;

  urlsArchivos: string[] = [];
  archivosPreview: { nombre: string, tipo: string, imgBase64?: string, icono?: string, color?: string }[] = [];
  archivos: File[] = [];

  editorModules = {
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@'],
      source: (searchTerm: string, renderList: (matches: any[], searchTerm: string) => void, mentionChar: string) => {
        const getInitials = (name: string) => {
          if (!name) return '?';
          const parts = name.split(' ').filter(p => p.length > 0);
          if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
          return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        };

        const responsables = this.taskResponsibleService.responsables;
        const values = responsables.map(u => ({ 
          id: u.id, 
          value: u.nombre,
          color: u.color,
          posicion: u.posicion,
          initials: getInitials(u.nombre)
        }));
        
        if (searchTerm.length === 0) {
          renderList(values, searchTerm);
        } else {
          const matches = values.filter(v => v.value.toLowerCase().includes(searchTerm.toLowerCase()));
          renderList(matches, searchTerm);
        }
      },
      renderItem: (item: any, searchTerm: string) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '10px';
        div.style.padding = '4px 0';
        
        const avatarStr = `
          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${item.color || '#94a3b8'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0;">
            ${item.initials}
          </div>
          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-size: 14px; font-weight: 600; color: #334155;">${item.value}</span>
            <span style="font-size: 11px; color: #64748b;">${item.posicion || 'Sin área'}</span>
          </div>
        `;
        div.innerHTML = avatarStr;
        return div;
      }
    }
  };

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
    private fixedAssetsService: FixedAssetsService,
    private firebaseStorage: FirebaseStorageService,
    public taskResponsibleService: TaskResponsibleService
  ) {}

  ngOnInit(): void {
    this.areas = this.areasService.areas;
    if (this.idArea !== '0') {
      const areaEncontrada = this.areas.find(x => String(x.id) === String(this.idArea));
      if (areaEncontrada) {
        this.ticket.idArea = areaEncontrada.id;
      }
    }

    const rawUser = localStorage.getItem('rwuserdatatk');
    if (rawUser) {
      this.usuarioActivo = JSON.parse(rawUser);
    }

    this.obtenerSucursales();
    this.obtenerCategorias();
    this.obtenerUsuariosHelp();
    this.obtenerPrioridadesTicket();
  }

  obtenerSucursales(): void {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        if (this.usuarioActivo.sucursales?.length > 0) {
          this.ticket.idSucursal = parseInt(this.usuarioActivo.sucursales[0].id, 10);
        }
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

  onChangeArea(): void {
    this.ticket.idCategoria = '';
    this.ticket.idSubcategoria = null;
    this.ticket.nombreCategoria = '';
    this.ticket.nombreSubcategoria = '';
    this.formCategoria = null;
    this.cdr.detectChanges();
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

    const nombreCatParaValidar = this.ticket.nombreSubcategoria || this.ticket.nombreCategoria || '';
    if (
      this.incluirEvidenciaCadenaSuministro(nombreCatParaValidar) &&
      this.archivos.length === 0 &&
      String(this.ticket.idArea) === '20'
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción requerida',
        text: 'Para la categoría ' + nombreCatParaValidar + ' es necesario subir evidencia.',
        confirmButtonText: 'Aceptar',
        customClass: {
          container: 'swal-topmost'
        }
      });
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

    this.ticket.idInvolucrados = idsResponsablesTicket;
    this.ticket.idSucursal = this.ticket.idSucursal.toString();
    this.ticket.idArea = this.ticket.idArea.toString();
    this.ticket.idCategoria = this.ticket.idCategoria.toString();
    this.ticket.idSubcategoria = this.ticket.idSubcategoria ? this.ticket.idSubcategoria.toString() : null;
    this.ticket.idResponsable = this.obtenerIdResponsableTicket();
    this.ticket.idTipoSoporte = this.obtenerTipoSoporte(this.ticket.idArea);
    this.ticket.idUsuario = this.usuarioActivo.id;
    this.ticket.usuariosEtiquetados = MentionUtils.extraerUsuariosEtiquetados(this.ticket.descripcion);
    this.ticket.folio = folio;

    if (this.archivos.length > 0) {
      this.firebaseStorage.cargarArchivosTicket(this.archivos)
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
    const areaFiltro = this.ticket.idArea && String(this.ticket.idArea) !== '0' ? this.ticket.idArea : this.idArea;
    const usuarioResponsable = this.catUsuariosHelp.find(x => 
      x.idRol === '4' && 
      String(x.idArea) === String(areaFiltro) &&
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

  buscarActivoFijo(): void {
    if (!this.ticket.referenciaActivoFijo) return;
    this.fixedAssetsService
      .getByReference(this.ticket.referenciaActivoFijo)
      .subscribe(result => {
        this.activoFijo = result;
        this.cdr.detectChanges();

        if (!result) {
          this.showMessage('warn', 'Warning', 'No se encontró activo con referencia ' + this.ticket.referenciaActivoFijo);
          this.ticket.referenciaActivoFijo = '';
        }
      });
  }

  onSeleccionarImagenes(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const nuevosArchivos = Array.from(input.files);

    nuevosArchivos.forEach(file => {
      this.archivos.push(file);
      const previewItem: { nombre: string, tipo: string, imgBase64?: string, icono?: string, color?: string } = {
        nombre: file.name,
        tipo: file.type,
        icono: FileUtils.obtenerIconoArchivo(file.name, file.type),
        color: FileUtils.obtenerColorArchivo(file.name, file.type)
      };
      
      this.archivosPreview.push(previewItem);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            previewItem.imgBase64 = reader.result;
            this.cdr.detectChanges();
          }
        };
        reader.readAsDataURL(file);
      }
    });

    input.value = ''; // Permite volver a seleccionar el mismo archivo si es necesario
    this.cdr.detectChanges();
  }

  removerArchivo(index: number): void {
    this.archivos.splice(index, 1);
    this.archivosPreview.splice(index, 1);
    this.cdr.detectChanges();
  }

  incluirEvidenciaCadenaSuministro(categoria: string): boolean {
    const categoriasPermitidas = [
      'FACTURA EN PORTAL',
      'PROVEEDOR SIN FACTURA',
      'RETRASO DE PROVEEDOR',
      'COMPRAS ESPECIALES',
      'MOVIMIENTOS ENTRE SUCURSALES'
    ];

    return !categoriasPermitidas.includes(
      categoria.trim().toUpperCase()
    );
  }
}
