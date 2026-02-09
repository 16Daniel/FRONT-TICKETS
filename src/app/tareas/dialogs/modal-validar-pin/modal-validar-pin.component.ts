import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'ngx-avatars';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-validar-pin',
  standalone: true,
  imports: [DialogModule, CommonModule, FormsModule, ButtonModule, AvatarModule],
  templateUrl: './modal-validar-pin.component.html',
  styleUrl: './modal-validar-pin.component.scss'
})
export class ModalValidarPinComponent {
  @ViewChild('pinInput') pinInput!: ElementRef;
  @Output() pinValidado = new EventEmitter<any>();

  mostrarModalPin = false;
  pinIngresado = '';
  errorPin = '';
  responsableSeleccionado: any = null;

  abrirModalPin(responsable: any): void {
    this.responsableSeleccionado = responsable;
    this.pinIngresado = '';
    this.errorPin = '';
    this.mostrarModalPin = true;

    // Pequeño timeout para asegurar que el input esté en el DOM antes del focus
    setTimeout(() => this.pinInput?.nativeElement.focus(), 100);
  }

  onPinChange(): void {
    // Limpiar caracteres no numéricos
    this.pinIngresado = this.pinIngresado.replace(/\D/g, '').slice(0, 4);
    this.errorPin = '';

    // Autovalidación al completar los 4 dígitos
    if (this.pinIngresado.length === 4) {
      this.validarPin();
    }
  }

  validarPin(): void {
    if (this.pinIngresado === this.responsableSeleccionado?.pin) {
      this.pinValidado.emit(this.responsableSeleccionado);
      this.cerrarModalPin();
    } else {
      this.errorPin = 'PIN Incorrecto';
      this.pinIngresado = ''; // Opcional: limpiar para reintento
      this.triggerShake();
    }
  }

  triggerShake(): void {
    // Lógica para resetear la animación si fuera necesario
  }

  cerrarModalPin(): void {
    this.mostrarModalPin = false;
    this.pinIngresado = '';
    this.errorPin = '';
  }
}
