import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { ModalVisorImagenesComponent } from '../../../shared/dialogs/modal-visor-imagenes/modal-visor-imagenes.component';
import { LinkifyPipe } from '../../../shared/pipes/linkify.pipe';
import { TareasService } from '../../services/tareas.service';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { Tarea } from '../../interfaces/tarea.model';
import { Comentario } from '../../../shared/interfaces/comentario-chat.model';

@Component({
  selector: 'app-task-comment-box',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalVisorImagenesComponent, LinkifyPipe],
  templateUrl: './task-comment-box.component.html',
  styleUrl: './task-comment-box.component.scss'
})
export class TaskCommentBoxComponent implements OnInit {
  @Input() tarea: Tarea = new Tarea;

  nuevoComentario: string = '';
  usuario!: Usuario;
  imagenesComentario: File[] = [];
  urlImagen!: string;
  mostrarModalImagen: boolean = false;
  enviando = false;

  constructor(
    private tareasService: TareasService,
    private firebaseStorageService: FirebaseStorageService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);


    this.tarea.comentarios = this.tarea.comentarios.map(c => {
      return {
        ...c,
        fecha: c.fecha instanceof Timestamp ? c.fecha.toDate() : c.fecha
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
      const comentario: Comentario = {
        comentario: texto,
        fecha: new Date(),
        idUsuario: this.usuario.id,
        nombre: this.usuario.nombre,
        imagenesEvidencia: []
      };

      const url = await this.firebaseStorageService.cargarImagenesEvidenciasTareas(this.imagenesComentario);
      comentario.imagenesEvidencia = [...url];

      this.tarea.comentarios.unshift(comentario);
      await this.tareasService.update(this.tarea, this.tarea.id!);

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

    event.preventDefault();
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

}
