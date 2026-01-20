import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

import { Usuario } from '../../../usuarios/models/usuario.model';
import { CalendarColorsService } from '../../services/calendar-colors.service';
import { ColorUsuario } from '../../interfaces/color-usuario';

@Component({
  selector: 'app-modal-colors',
  standalone: true,
  imports: [CommonModule, ToastModule, ColorPickerModule, FormsModule, DialogModule, DropdownModule, ButtonModule, TableModule],
  providers: [MessageService],
  templateUrl: './modal-colors.component.html',
})

export class ModalColorsComponent implements OnInit {
  public colores: ColorUsuario[] = [];
  public coleccion: string = 'colores-usuarios';
  public formcolor: string = '';
  public usuarioSeleccionado: Usuario | undefined;
  usuario: Usuario;
  @Input() showModalColors: boolean = false;
  @Input() usuariosHelp: Usuario[] = [];
  @Output() closeEvent = new EventEmitter<boolean>();

  constructor(
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private calendarColorsService: CalendarColorsService) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  ngOnInit(): void {
    this.calendarColorsService.getByArea(this.usuario.idArea).subscribe(result => {
      this.colores = result;
    })
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  async agregarColor() {
    let color: ColorUsuario =
    {
      idUsuario: this.usuarioSeleccionado!.id,
      idArea: this.usuario.idArea,
      color: this.formcolor
    }

    await this.calendarColorsService.create(color);
    Swal.fire({
      title: "OK",
      text: "CREADO CORRECTAMENTE",
      icon: "success",
      customClass: {
        container: 'swal-topmost'
      }
    });
  }

  obtenerNombreUsuario(idUsuario: string): string {
    let nombre = '';
    let temp = this.usuariosHelp.filter(x => x.id == idUsuario);
    if (temp.length > 0) { nombre = temp[0].nombre + ' ' + temp[0].apellidoP; }
    return nombre
  }

  async EliminarColor(id: string) {

    await this.calendarColorsService.delete(id);
    Swal.fire({
      title: "OK",
      text: "ELIMINADO CORRECTAMENTE",
      icon: "success",
      customClass: {
        container: 'swal-topmost'
      }
    });
  }

}
