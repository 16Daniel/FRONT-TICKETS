import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';
import { Compra } from '../../interfaces/compra.model';
import { ComprasService } from '../../services/compras.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Comentario } from '../../../shared/interfaces/comentario-chat.model';
import { DatesHelperService } from '../../../shared/helpers/dates-helper.service';

@Component({
  selector: 'app-comentarios-compra-dialog',
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './comentarios-compra-dialog.component.html',
  styleUrl: './comentarios-compra-dialog.component.scss'
})
export class ComentariosCompraDialogComponent {
  @Input() mostrarModal: boolean = false;
  @Input() compra!: Compra;
  @Output() closeEvent = new EventEmitter<boolean>();
  usuario: Usuario;

  nuevoComentario: string = '';

  constructor(
    private comprasService: ComprasService,
    private cdr: ChangeDetectorRef,
    public datesHelper: DatesHelperService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  onHide() {
    this.closeEvent.emit(false);
  }

  async agregarComentario() {
    if (!this.nuevoComentario.trim()) return;

    const comentarios = this.compra.comentarios ? [...this.compra.comentarios] : [];
    let comentario = {
      nombre: this.usuario.nombre + ' ' + this.usuario.apellidoP,
      idUsuario: this.usuario.id,
      comentario: this.nuevoComentario.trim(),
      fecha: new Date()
    }
    comentarios.push(comentario);

    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Guardando comentario...',
      didOpen: () => Swal.showLoading(),
      customClass: {
        container: 'swal-topmost'
      }
    });

    await this.comprasService.update({ comentarios }, this.compra.id!);
    this.compra.comentarios = comentarios;
    this.nuevoComentario = '';
    this.cdr.detectChanges();

    Swal.close();
    Swal.fire({
      title: 'OK',
      text: 'Comentario agregado',
      icon: 'success',
      customClass: {
        container: 'swal-topmost'
      }
    });
  }
}
