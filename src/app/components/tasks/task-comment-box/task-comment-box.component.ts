import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';

import { Comentario } from '../../../models/comentario-chat.model';
import { Tarea } from '../../../models/tarea.model';
import { Usuario } from '../../../models/usuario.model';
import { TareasService } from '../../../services/tareas.service';
import { FirebaseStorageService } from '../../../services/firebase-storage.service';
import { ModalVisorImagenesComponent } from '../../../modals/modal-visor-imagenes/modal-visor-imagenes.component';

@Component({
  selector: 'app-task-comment-box',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalVisorImagenesComponent],
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
    const texto = this.nuevoComentario.trim();
    if (!texto && this.imagenesComentario.length === 0) return;

    const comentario: Comentario = {
      comentario: texto,
      fecha: new Date(),
      idUsuario: this.usuario.id,
      nombre: this.usuario.nombre,
      imagenesEvidencia: []
    };

    const url = await this.firebaseStorageService.cargarImagenesEvidenciasTareas(this.imagenesComentario);
    comentario.imagenesEvidencia = [...url];

    this.tarea.comentarios.push(comentario);
    await this.tareasService.update(this.tarea, this.tarea.id!);

    this.nuevoComentario = '';
    this.imagenesComentario = [];
    this.cdr.detectChanges();
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
}
