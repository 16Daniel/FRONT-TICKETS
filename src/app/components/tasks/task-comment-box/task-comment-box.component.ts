import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Comentario } from '../../../models/comentario-chat.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-comment-box',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './task-comment-box.component.html',
  styleUrl: './task-comment-box.component.scss'
})
export class TaskCommentBoxComponent {
  @Input() comentarios: Comentario[] = [];
  @Output() nuevoComentarioEvent = new EventEmitter<string>();

  nuevoComentario: string = '';

  enviarComentario() {
    const texto = this.nuevoComentario.trim();
    if (!texto) return;

    this.nuevoComentarioEvent.emit(texto);
    this.nuevoComentario = '';
  }
}
