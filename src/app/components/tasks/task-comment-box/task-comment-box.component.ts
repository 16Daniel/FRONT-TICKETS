import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comentario } from '../../../models/comentario-chat.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Tarea } from '../../../models/tarea.model';
import { Usuario } from '../../../models/usuario.model';
import { TareasService } from '../../../services/tareas.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-task-comment-box',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './task-comment-box.component.html',
  styleUrl: './task-comment-box.component.scss'
})
export class TaskCommentBoxComponent implements OnInit {
  @Input() tarea: Tarea = new Tarea;

  nuevoComentario: string = '';
  usuario!: Usuario;

  constructor(private tareasService: TareasService) { }

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
    if (!texto) return;

    const comentario: Comentario = {
      comentario: this.nuevoComentario,
      fecha: new Date,
      idUsuario: this.usuario.id,
      nombre: this.usuario.nombre
    }
    this.tarea.comentarios.push(comentario);
    await this.tareasService.update(this.tarea, this.tarea.id!);
    this.nuevoComentario = '';
  }
}
