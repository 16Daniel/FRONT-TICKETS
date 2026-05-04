import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

import { AvatarModule } from 'ngx-avatars';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { ModalVisorImagenesComponent } from '../../../shared/dialogs/modal-visor-imagenes/modal-visor-imagenes.component';
import { FormatCommentPipe } from '../../../shared/pipes/format-comment.pipe';
import { TareasService } from '../../services/tareas.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { Tarea } from '../../interfaces/tarea.interface';
import { Comentario } from '../../../shared/interfaces/comentario-chat.model';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { EnviarCorreoRequest, MailService } from '../../../shared/services/mail.service';

@Component({
  selector: 'app-caja-comentarios-tarea',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalVisorImagenesComponent, FormatCommentPipe, AvatarModule],
  templateUrl: './caja-comentarios-tarea.component.html',
  styleUrl: './caja-comentarios-tarea.component.scss'
})
export class CajaComentariosTareaComponent implements OnInit {
  @Input() tarea: Tarea = new Tarea;
  responsableActivo!: ResponsableTarea;

  nuevoComentario: string = '';
  usuario!: Usuario;
  imagenesComentario: File[] = [];
  urlImagen!: string;
  mostrarModalImagen: boolean = false;
  enviando = false;

  @ViewChild('textareaComentario') textareaComentario!: import('@angular/core').ElementRef<HTMLTextAreaElement>;

  responsablesTarea: ResponsableTarea[] = [];
  responsablesFiltrados: ResponsableTarea[] = [];
  mostrarMenciones: boolean = false;
  textoBusquedaMencion: string = '';

  constructor(
    private tareasService: TareasService,
    private taskResponsibleService: TaskResponsibleService,
    private firebaseStorageService: FirebaseStorageService,
    private mailService: MailService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.responsableActivo = JSON.parse(localStorage.getItem('responsable-tareas')!);

    this.tarea.comentarios = this.tarea.comentarios.map(c => {
      return {
        ...c,
        fecha: c.fecha instanceof Timestamp ? c.fecha.toDate() : c.fecha
      }
    });

    this.taskResponsibleService.responsables$.subscribe(responsables => {
      if (this.tarea.idsResponsables && this.tarea.idsResponsables.length > 0) {
        this.responsablesTarea = responsables.filter(r => this.tarea.idsResponsables.includes(r.id!));
      } else {
        this.responsablesTarea = [];
      }
    });
  }

  async enviarComentario() {
    if (this.enviando) return;      // ⛔ evita doble clic
    this.enviando = true;           // 🔒 bloquea el botón temporalmente

    const texto = this.nuevoComentario.trim();
    if (!texto && this.imagenesComentario.length === 0) {
      this.enviando = false;
      return;
    }

    try {
      const mentionRegex = /@\[([^\]]+)\]/g;
      const menciones: { id: string, nombre: string, correo: string }[] = [];
      let match;
      while ((match = mentionRegex.exec(texto)) !== null) {
        const nombreMencionado = match[1];
        const responsable = this.responsablesTarea.find(r => r.nombre === nombreMencionado);
        if (responsable && responsable.id) {
          if (!menciones.find(m => m.id === responsable.id)) {
            menciones.push({
              id: responsable.id,
              nombre: responsable.nombre,
              correo: responsable.correo
            });
          }
        }
      }

      const comentario: Comentario = {
        comentario: texto,
        fecha: new Date(),
        idUsuario: this.usuario.id,
        nombre: this.responsableActivo.nombre,
        imagenesEvidencia: [],
        menciones: menciones.length > 0 ? menciones : undefined
      };

      const url = await this.firebaseStorageService.cargarImagenesEvidenciasTareas(this.imagenesComentario);
      comentario.imagenesEvidencia = [...url];

      this.tarea.comentarios.unshift(comentario);
      await this.tareasService.update(this.tarea, this.tarea.id!);

      if (menciones.length > 0) {
        this.enviarNotificacionesMencion(menciones, texto);
      }

      this.nuevoComentario = '';
      this.imagenesComentario = [];
      this.cdr.detectChanges();
    } finally {
      this.enviando = false;
    }
  }

  async cargarImagenComentario(event: any) {
    const archivos: FileList = event.target.files;
    if (!archivos || archivos.length === 0) return;

    for (let i = 0; i < archivos.length; i++) {
      this.imagenesComentario.push(archivos[i]);
    }
  }

  verImagen(url: string) {
    this.mostrarModalImagen = true;
    this.urlImagen = url;
  }

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;

    Array.from(items).forEach(item => {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          this.imagenesComentario.push(file);
        }
      }
    });
  }

  onInputTextarea(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    const cursorPos = textarea.selectionStart;

    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbolIndex !== -1) {
      const isAtValidPosition = lastAtSymbolIndex === 0 || /\s|\]/.test(textBeforeCursor.charAt(lastAtSymbolIndex - 1));

      if (isAtValidPosition) {
        const searchText = textBeforeCursor.substring(lastAtSymbolIndex + 1);

        if (!/\s/.test(searchText)) {
          this.textoBusquedaMencion = searchText.toLowerCase();

          this.responsablesFiltrados = this.responsablesTarea.filter(r =>
            r.nombre.toLowerCase().includes(this.textoBusquedaMencion)
          );

          if (this.responsablesFiltrados.length > 0) {
            this.mostrarMenciones = true;
            return;
          }
        }
      }
    }
    this.mostrarMenciones = false;
  }

  seleccionarMencion(responsable: ResponsableTarea) {
    const textarea = this.textareaComentario.nativeElement;
    const cursorPos = textarea.selectionStart;
    const value = this.nuevoComentario;

    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');

    const textBeforeMention = value.substring(0, lastAtSymbolIndex);
    const textAfterCursor = value.substring(cursorPos);

    const mentionText = `@[${responsable.nombre}] `;

    this.nuevoComentario = textBeforeMention + mentionText + textAfterCursor;
    this.mostrarMenciones = false;

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = lastAtSymbolIndex + mentionText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  async eliminarComentario(comentario: Comentario) {

    const result = await Swal.fire({
      title: '¿Eliminar comentario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost'
      }
    });

    if (!result.isConfirmed) return;

    try {
      this.tarea.comentarios = this.tarea.comentarios.filter(c => c !== comentario);

      await this.tareasService.update(this.tarea, this.tarea.id!);

      Swal.fire({
        icon: 'success',
        title: 'Comentario eliminado',
        timer: 1200,
        showConfirmButton: false,
        customClass: {
          container: 'swal-topmost'
        }
      });

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el comentario'
      });
    }
  }

  editarComentario(c: any) {
    c.editando = true;
    c.comentarioEditado = c.comentario;
  }

  cancelarEdicion(c: any) {
    c.editando = false;
    c.comentarioEditado = '';
  }

  guardarEdicion(c: any) {
    if (!c.comentarioEditado?.trim()) return;

    c.comentario = c.comentarioEditado;
    c.editando = false;

    this.tareasService.update(this.tarea, this.tarea.id!);
  }

  enviarNotificacionesMencion(menciones: { id: string, nombre: string, correo: string }[], comentarioTexto: string) {
    menciones.forEach(m => {
      if (!m.correo) return;
      const request: EnviarCorreoRequest = {
        titulo: `Has sido mencionado en la tarea: ${this.tarea.titulo}`,
        body: this.generarBodyCorreoMencion(m.nombre, comentarioTexto),
        destinatario: m.correo
      };

      this.mailService.enviarCorreo(request).subscribe({
        next: res => console.log('Correo de mención enviado a', m.correo),
        error: err => console.error('Error al enviar correo de mención', err)
      });
    });
  }

  private generarBodyCorreoMencion(nombre: string, comentario: string): string {
    const comentarioHtml = comentario.replace(/\n/g, '<br>');
    return `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #333; line-height: 1.4;">
      <h3 style="color: #2c3e50; margin-bottom: 8px;">
        📌 Mención en Tarea
      </h3>
      <p style="margin: 0 0 8px 0;">
        Hola <strong>${nombre}</strong>,
      </p>
      <p style="margin: 0 0 12px 0;">
        Se te ha mencionado en un comentario de la tarea <strong>${this.tarea.titulo}</strong>:
      </p>
      <div style="padding: 10px 12px; background-color: #f8f9fa; border-radius: 6px; font-style: italic;">
        ${comentarioHtml}
      </div>
      <p style="margin-top: 14px;">
        Por favor ingresa al sistema para revisar la tarea y responder.
      </p>
      <hr style="margin: 16px 0;" />
      <p style="font-size: 12px; color: #777; margin: 0;">
        Este correo fue generado automáticamente por el sistema de tickets.
      </p>
    </div>
    `;
  }

}
