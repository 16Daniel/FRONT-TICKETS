import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Responsable } from '../../interfaces/responsable.interface';
import { CommonModule } from '@angular/common';
import { ResponsablesService } from '../../services/responsables.service';
import { Usuario } from '../../interfaces/usuario.model';
import { Router } from '@angular/router';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AccessControlService } from '../../../shared/services/access-control.service';

@Component({
  selector: 'app-seleccionar-responsable-page',
  standalone: true,
  imports: [CommonModule, AvatarModule, TooltipModule, ButtonModule, FormsModule],
  templateUrl: './seleccionar-responsable-page.component.html',
  styleUrl: './seleccionar-responsable-page.component.scss'
})
export default class SeleccionarResponsablePageComponent implements OnInit {
  responsablesService = inject(ResponsablesService);
  accessControl = inject(AccessControlService);

  responsableActivoSeleccionado?: Responsable | any;
  resposablesDeSucursal: Responsable[] = [];
  usuario!: Usuario;
  idSucursalSeleccionada: string = '';

  @ViewChild('pinInput') pinInput!: ElementRef<HTMLInputElement>;

  pinIngresado = '';
  errorPin = '';
  responsableSeleccionado: any = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    localStorage.removeItem('responsable-tareas');
    this.accessControl.inicializarEscuchaUsuario();

    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk') || '{}');
    this.idSucursalSeleccionada = this.usuario?.sucursales?.[0]?.id || '';

    this.responsablesService.responsables$.subscribe(() => {
      this.resposablesDeSucursal = this.responsablesService.filtrarPorSucursal(this.idSucursalSeleccionada, false);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.pinInput?.nativeElement.focus();
    }, 0);
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

  async validarPin() {
    if (this.pinIngresado.length !== 4) return;

    const responsable = this.responsablesService.buscarPorPin(this.pinIngresado);

    if (!responsable) {
      this.errorPin = 'PIN incorrecto';
      this.pinIngresado = '';
      return;
    }

    this.errorPin = '';
    this.responsableSeleccionado = responsable;

    localStorage.setItem(
      'responsable-tareas',
      JSON.stringify(responsable)
    );

    await this.accessControl.ensureLoaded();
    const rutaDestino = this.accessControl.getPrimeraRutaPermitida() || '/main/sin-acceso';
    this.router.navigate([rutaDestino]);
  }

  cancelar() {
    this.router.navigate(['/auth/login']);
  }
}
