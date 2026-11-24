import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';

import { AceiteService } from '../../services/aceite.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';

@Component({
  selector: 'app-agregar-recoleccion-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule, CalendarModule, DropdownModule],
  templateUrl: './agregar-recoleccion-dialog.component.html',
  styleUrl: './agregar-recoleccion-dialog.component.scss',
})
export class AgregarRecoleccionDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() sucursales: Sucursal[] = [];
  public sucursal: Sucursal | undefined;
  public fecha: Date = new Date();
  public loading: boolean = false;
  @Input() trampaDeAceite: boolean = false;

  constructor(public aceiteService: AceiteService) { }

  ngOnInit(): void { this.sucursales = this.sucursales.filter(x => x.id != '-1'); }

  onHide() {
    this.closeEvent.emit(false);
  }

  guardar() {
    this.loading = true;
    this.aceiteService.agregarEntregaManual(this.sucursal!.idFront!, this.fecha).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          title: 'Correcto',
          text: 'Recolección agregada correctamente',
          icon: 'success',
          confirmButtonColor: '#D3152A',
          customClass: {
            container: 'swal-topmost'
          }
        });
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
        Swal.fire({
          title: 'Error',
          text: 'Error al procesar la solicitud',
          icon: 'error',
          confirmButtonColor: '#D3152A',
          customClass: {
            container: 'swal-topmost'
          }
        });
      },
    });
  }

  guardarTA() {
    this.loading = true;
    this.aceiteService.agregarEntregaManualTrampaAceite(this.sucursal!.idFront!, this.fecha).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          title: 'Correcto',
          text: 'Recolección agregada correctamente',
          icon: 'success',
          confirmButtonColor: '#D3152A',
          customClass: {
            container: 'swal-topmost'
          }
        });
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
        Swal.fire({
          title: 'Error',
          text: 'Error al procesar la solicitud',
          icon: 'error',
          confirmButtonColor: '#D3152A',
          customClass: {
            container: 'swal-topmost'
          }
        });
      },
    });
  }

}
