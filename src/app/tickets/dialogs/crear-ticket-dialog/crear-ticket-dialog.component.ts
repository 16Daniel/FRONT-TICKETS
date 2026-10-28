import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import Swal from 'sweetalert2';

import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Area } from '../../../areas/interfaces/area.model';
import { Categoria } from '../../../categorias/models/categoria.model';
import { PrioridadTicket } from '../../interfaces/prioridad-ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { FolioGeneratorService } from '../../services/folio-generator.service';
import { CategoriesService } from '../../../categorias/services/categories.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { AreasService } from '../../../areas/services/areas.service';
import { TicketsPriorityService } from '../../services/tickets-priority.service';
import { FixedAssetsService } from '../../../activos-fijos/services/fixed-assets.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { Subcategoria } from '../../../categorias/interfaces/subcategoria.interface';
import { ActivoFijo } from '../../../activos-fijos/interfaces/activo-fijo.interface';
import { ParticipanteChat } from '../../../shared/interfaces/participante-chat.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { SelectorArbolCategoriaComponent } from '../../../categorias/components/selector-arbol-categoria/selector-arbol-categoria.component';
import { SeleccionArbolCategoria } from '../../../categorias/interfaces/seleccion-arbol-categoria.interface';
import { FileUtils } from '../../../shared/utils/file.utils';
import { ResponsablesService } from '../../../usuarios/services/responsables.service';
import { Responsable } from '../../../usuarios/interfaces/responsable.interface';
import { MatrizUrgenciaService } from '../../../categorias/services/matriz-urgencia.service';
import { MatrizUrgencia } from '../../../categorias/interfaces/matriz-urgencia.interface';
import { MensajesPendientesService } from '../../../shared/services/mensajes-pendientes.service';
import { environment } from '../../../../environments/environments';

import Quill from 'quill';
import { Mention, MentionBlot } from 'quill-mention';
import { MentionUtils } from '../../../shared/utils/mention.utils';
import MagicUrl from 'quill-magic-url';
import { BitacoraService } from '../../../shared/services/bitacora.service';
import { Timestamp } from '@angular/fire/firestore';
import { WhatsappService } from '../../../areas/services/whatsapp.service';
import {
  HistorialAlertasService
} from '../../../alertas/service/historial-alertas.service';

Quill.register({ 'blots/mention': MentionBlot, 'modules/mention': Mention });
Quill.register('modules/magicUrl', MagicUrl);

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
export class CrearTicketDialogComponent implements OnInit, OnDestroy {
  @Input() mostrarModalGenerateTicket: boolean = false;
  @Input() idArea: string = '0';
  @Output() closeEvent = new EventEmitter<boolean>();

  ticket: Ticket = new Ticket();
  sucursales: Sucursal[] = [];
  usuarioActivo: Usuario = new Usuario();
  responsableActivo: Responsable | null = null;
  areas: Area[] = [];
  private areasSub: Subscription | undefined;
  private areaInicialAsignada: boolean = false;
  categorias: Categoria[] = [];
  prioridadesTicket: PrioridadTicket[] = [];
  formCategoria: any = null;
  private alertaWhatsappSeleccionada = false;
  catUsuariosHelp: Usuario[] = [];
  matrizUrgenciaLocal: MatrizUrgencia | null = null;

  esActivoFijo: boolean = false;
  desdeActivoFijo: boolean = false;
  @Input() activoFijo: ActivoFijo | undefined;

  urlsArchivos: string[] = [];
  archivosPreview: { nombre: string, tipo: string, imgBase64?: string, icono?: string, color?: string }[] = [];
  archivos: File[] = [];
  // public catproveedores:ProveedorPlaneacion[] = []; 
  public catproveedores:any[] = []; 
  public formProveedor: any = null; 

  get requiereEvidencia(): boolean {
    const requierePorCategoria = this.formCategoria?.evidenciaObligatoria === true;
    const nombreCatParaValidar = this.ticket.nombreSubcategoria || this.ticket.nombreCategoria || '';
    const requierePorSuministro = this.incluirEvidenciaCadenaSuministro(nombreCatParaValidar) && String(this.ticket.idArea) === '20';
    return requierePorCategoria || requierePorSuministro;
  }

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

        const responsables = this.responsablesService.responsables;
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
    },
    magicUrl: true
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
    public responsablesService: ResponsablesService,
    private bitacoraService: BitacoraService,
    private matrizUrgenciaService: MatrizUrgenciaService,
    private mensajesPendientesService: MensajesPendientesService,
    private whatsappService: WhatsappService,
    private historialAlertasService: HistorialAlertasService
  ) {}

  ngOnInit(): void {
    if (this.activoFijo && this.activoFijo.referencia) {
      this.desdeActivoFijo = true;
      this.esActivoFijo = true;
      this.ticket.referenciaActivoFijo = this.activoFijo.referencia;
      if (this.activoFijo.idArea) {
        this.ticket.idArea = String(this.activoFijo.idArea);
      }
    } else if (this.idArea !== '0') {
      this.ticket.idArea = String(this.idArea);
    }

    // Suscripción reactiva a las áreas (mismo patrón que admin-tabs):
    // si el listener de Firestore aún no ha emitido, el modal se llena en cuanto lleguen los datos.
    this.obtenerAreas();

    const rawUser = localStorage.getItem('rwuserdatatk');
    if (rawUser) {
      this.usuarioActivo = JSON.parse(rawUser);
    }

    const rawResp = localStorage.getItem('responsable-tareas');
    if (rawResp) {
      this.responsableActivo = JSON.parse(rawResp);
    }

    this.ticket.solicitante =
      this.responsableActivo?.nombre ||
      `${this.usuarioActivo?.nombre || ''} ${this.usuarioActivo?.apellidoP || ''}`.trim();

    this.obtenerSucursales();
    this.obtenerCategorias();
    this.obtenerUsuariosHelp();
    this.obtenerPrioridadesTicket();

    // Obtener la matriz de urgencia correspondiente al área
    if (this.ticket.idArea && this.ticket.idArea !== '0') {
      this.cargarMatrizArea(String(this.ticket.idArea));
    } else if (this.idArea && this.idArea !== '0') {
      this.cargarMatrizArea(this.idArea);
    }
  }

  ngOnDestroy(): void {
    this.areasSub?.unsubscribe();
  }

  obtenerAreas(): void {
    this.areasService.initListener();
    this.areasSub = this.areasService.areas$.subscribe((areas) => {
      this.areas = areas.filter((a) => a.activarTickets === true);
      this.asignarAreaInicial();
      this.cdr.detectChanges();
    });
  }

  /** Empata el área preseleccionada (activo fijo o @Input idArea) con la opción real del catálogo. */
  private asignarAreaInicial(): void {
    if (this.areaInicialAsignada || this.areas.length === 0) return;

    const idBuscado = this.desdeActivoFijo
      ? this.activoFijo?.idArea
      : this.idArea !== '0' ? this.idArea : null;

    if (idBuscado) {
      const areaEncontrada = this.areas.find((x) => String(x.id) === String(idBuscado));
      if (areaEncontrada) {
        this.ticket.idArea = areaEncontrada.id;
      }
    }
    this.areaInicialAsignada = true;
  }

  cargarMatrizArea(idArea: string): void {
    this.matrizUrgenciaService.obtenerMatrizPorArea(idArea).subscribe({
      next: (matriz) => {
        this.matrizUrgenciaLocal = matriz;
      },
      error: (err) => console.error('Error al cargar matriz de urgencia', err)
    });
  }

  obtenerSucursales(): void {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        if (this.desdeActivoFijo && this.activoFijo?.idSucursal) {
          const sucEncontrada = data.find(s => String(s.id) === String(this.activoFijo!.idSucursal));
          this.ticket.idSucursal = sucEncontrada ? sucEncontrada.id : this.activoFijo.idSucursal;
        } else if (this.usuarioActivo.sucursales?.length > 0) {
          this.ticket.idSucursal = this.usuarioActivo.sucursales[0].id;
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
    this.alertaWhatsappSeleccionada = false;
    this.cargarMatrizArea(String(this.ticket.idArea));
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

  /* Selección de Categoría desde el Árbol */
  onSeleccionarCategoria(seleccion: SeleccionArbolCategoria): void {
    this.formCategoria = seleccion.categoria;
    this.alertaWhatsappSeleccionada =
      seleccion.categoria.alertaWhatsapp === true ||
      seleccion.subcategoria?.alertaWhatsapp === true;
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

    // Calcular SLA de atención (Urgencia) basado en la matriz
    const celda = this.matrizUrgenciaService.obtenerCelda(this.matrizUrgenciaLocal, this.ticket.criticidad, this.ticket.urgencia);
    this.ticket.horasAtencion = celda.horas;
    this.ticket.tiempoAtencion = celda.valor;
    this.ticket.unidadAtencion = celda.unidad as any;
  }

  onLimpiarCategoria(): void {
    this.formCategoria = null;
    this.alertaWhatsappSeleccionada = false;
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
    this.ticket.horasAtencion = undefined;
    this.ticket.tiempoAtencion = undefined;
    this.ticket.unidadAtencion = undefined;
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
      this.requiereEvidencia &&
      this.archivos.length === 0
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Acción requerida',
        text: 'Para la categoría seleccionada es necesario subir evidencia obligatoriamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#D3152A',
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
    let alertaTicketRepetido = false;
    try {
      const ultimosTickets = await this.ticketsService.obtenerUltimosTicketsPorUsuario(
        String(this.usuarioActivo.id)
      );
      alertaTicketRepetido = ultimosTickets.length === 3 &&
        ultimosTickets.every(ticket =>
          String(ticket.idSucursal) === String(this.ticket.idSucursal) &&
          String(ticket.idCategoria) === String(this.ticket.idCategoria) &&
          (
            !this.ticket.idSubcategoria ||
            String(ticket.idSubcategoria ?? '') === String(this.ticket.idSubcategoria)
          )
        );
    } catch (error) {
      console.error('Error al revisar los tickets recientes del usuario:', error);
      this.showMessage(
        'warn',
        'No se pudo validar el historial',
        'El ticket se creará, pero no fue posible revisar si se repite entre los últimos tickets.'
      );
    }

    let archivosSubidos: { url: string; nombre: string; tipo: string }[] = [];

    if (this.archivos.length > 0) {
      try {
        archivosSubidos = await this.firebaseStorage.cargarArchivosTicket(this.archivos);
      } catch (error) {
        console.error('Error al subir una o más imágenes:', error);
        this.showMessage('warn', 'Warning', 'Error al subir una o más imágenes');
      }
    }

    this.ticket.archivos = archivosSubidos;
    const ticketId = await this.ticketsService.create({ ...this.ticket });
    if (alertaTicketRepetido) {
      await this.registrarAlertaTicketRepetido(ticketId);
    }
    await this.enviarAlertaWhatsappSiCorresponde(ticketId);
    await this.registrarBitacoraSistema(ticketId, folio);
    await this.crearAlertasMenciones(ticketId);
    await this.ticketsService.incrementarContadorTickets();
    Swal.close();
    Swal.fire({ title: 'OK', text: 'TICKET CREADO!', icon: 'success', confirmButtonColor: '#D3152A' });
    this.closeEvent.emit();
  }

  private async registrarAlertaTicketRepetido(ticketId: string): Promise<void> {
    const usuarios = new Set<string>(this.ticket.idInvolucrados || []);
    if (this.ticket.idResponsable) {
      usuarios.add(String(this.ticket.idResponsable));
    }

    try {
      await this.historialAlertasService.registrarAlerta({
        ticketId,
        fecha: Timestamp.now(),
        idAlerta: '7',
        usuarios: Array.from(usuarios)
      });
    } catch (error) {
      console.error('Error al registrar la alerta de ticket repetido:', error);
      this.showMessage(
        'warn',
        'Ticket creado',
        'El ticket se creó, pero no fue posible registrar la alerta de posible repetición o enviar su notificación.'
      );
    }
  }

  private async enviarAlertaWhatsappSiCorresponde(ticketId: string): Promise<void> {
    if (!this.alertaWhatsappSeleccionada) {
      return;
    }

    try {
      await this.whatsappService.enviarMensajeTexto(
        environment.grupoWAGerencias,
        this.construirMensajeAlertaWhatsapp()
      );
    } catch (error) {
      console.error('Error al enviar la alerta del ticket por WhatsApp:', error);
      this.showMessage('warn', 'Error al enviar WhatsApp', 'El ticket se creó, pero no fue posible enviar la alerta.');
      return;
    }

    try {
      let involucrados = this.ticket.idInvolucrados || [];
      if(this.ticket.idResponsable !== '') {
        involucrados = [...involucrados, this.ticket.idResponsable];
      }
      await this.historialAlertasService.registrarAlerta({
        ticketId,
        fecha: Timestamp.now(),
        idAlerta: '1',
        usuarios: involucrados
      });
    } catch (error) {
      console.error('Error al registrar la alerta del ticket:', error);
      this.showMessage('warn', 'Error al registrar alerta', 'El mensaje se envió, pero no fue posible guardar la alerta o enviar su notificación push.');
    }
  }

  private construirMensajeAlertaWhatsapp(): string {
    const sucursal = this.sucursales.find(
      item => String(item.id) === String(this.ticket.idSucursal)
    )?.nombre || String(this.ticket.idSucursal);
    const area = this.areas.find(
      item => String(item.id) === String(this.ticket.idArea)
    )?.nombre || String(this.ticket.idArea);
    const descripcion = this.ticket.descripcion
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim();
    const descripcionCorta = descripcion.length > 500
      ? `${descripcion.slice(0, 497)}...`
      : descripcion;

    return [
      '*🚨TICKET DE ALTA PRIORIDAD:*',
      `*Área:* ${area}`,
      `*Sucursal:* ${sucursal}`,
      `*Categoría:* ${this.ticket.nombreCategoria || 'Sin categoría'}${this.ticket.nombreSubcategoria ? ` - ${this.ticket.nombreSubcategoria}` : ''}`,
      `*Folio:* ${this.ticket.folio}`,
      `*Prioridad:* ${this.ticket.prioridad || 'Sin prioridad'} (score ${this.ticket.score ?? 'N/D'})`,
      `*Solicitante:* ${this.ticket.solicitante || 'Sin especificar'}`,
      `*Descripción:* ${descripcionCorta || 'Sin descripción'}`
    ].join('\n');
  }

  async crearAlertasMenciones(ticketId: string): Promise<void> {
    if (!this.ticket.usuariosEtiquetados || this.ticket.usuariosEtiquetados.length === 0) {
      return;
    }

    let responsableRemitente: Responsable | null = null;
    const rawResp = localStorage.getItem('responsable-tareas');
    if (rawResp) {
      responsableRemitente = JSON.parse(rawResp);
    }

    const idUsuarioRemitente = responsableRemitente?.idUsuario || this.usuarioActivo?.id || '';
    const nombreRemitente =
      responsableRemitente?.nombre ||
      `${this.usuarioActivo?.nombre || ''} ${this.usuarioActivo?.apellidoP || ''}`.trim() ||
      this.ticket.solicitante ||
      'Sistema';

    const participantes = this.ticket.usuariosEtiquetados
      .map(idResponsable =>
        this.responsablesService.responsables.find(
          r => r.id === idResponsable || r.idUsuario === idResponsable
        )
      )
      .filter((r): r is Responsable => !!r && !!r.idUsuario)
      .map(r => ({ idUsuario: r.idUsuario }));

    if (participantes.length === 0) {
      return;
    }

    await this.mensajesPendientesService.crearMensajesPendientes(
      'Tickets',
      ticketId,
      {
        idUsuario: idUsuarioRemitente,
        nombre: nombreRemitente,
        comentario: this.ticket.descripcion,
      },
      participantes
    );
  }

  async registrarBitacoraSistema(ticketId: string, folio: string): Promise<void> {
    let responsable: any = null;
    const rawResp = localStorage.getItem('responsable-tareas');
    if (rawResp) {
      responsable = JSON.parse(rawResp);
    }

    const bitacoraEntry: any = {
      modulo: 'TICKETS',
      referenciaId: ticketId,
      tipo: 'SISTEMA',
      contenido: `Ticket creado con folio ${folio}`,
      autor: {
        id: responsable?.id || 'SISTEMA',
        nombre: responsable?.nombre || 'Sistema',
        color: responsable?.color || '#94a3b8'
      },
      fechaCreacion: Timestamp.now()
    };
    await this.bitacoraService.addEntrada(bitacoraEntry);
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

  requiereProveedor():boolean
{ 
  if(this.formCategoria == undefined || this.formCategoria == null)
    {
      return false;  
    }
  let idCategoria = this.formCategoria.id; 
  let categorias:number[] = [46,47,48,49,50,51,52,53,56,59,62]
  return categorias.includes(idCategoria)
}
}
