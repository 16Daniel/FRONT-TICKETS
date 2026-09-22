import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { CommonModule } from '@angular/common';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Router } from '@angular/router';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-seleccionar-responsable-page',
  standalone: true,
  imports: [CommonModule, AvatarModule, TooltipModule, ButtonModule, FormsModule],
  templateUrl: './seleccionar-responsable-page.component.html',
  styleUrl: './seleccionar-responsable-page.component.scss'
})
export default class SeleccionarResponsablePageComponent implements OnInit {
  taskResponsibleService = inject(TaskResponsibleService);

  responsableActivoSeleccionado?: ResponsableTarea | any;
  resposablesDeSucursal: ResponsableTarea[] = [];
  usuario!: Usuario;
  idSucursalSeleccionada: string = '';

  @ViewChild('pinInput') pinInput!: ElementRef<HTMLInputElement>;

  pinIngresado = '';
  errorPin = '';
  responsableSeleccionado: any = null;


  constructor(private router: Router) { }

  ngOnInit(): void {
    localStorage.removeItem('responsable-tareas');

    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursalSeleccionada = this.usuario.sucursales[0].id;

    this.taskResponsibleService.responsables$.subscribe(() => {
      this.resposablesDeSucursal = this.taskResponsibleService.filtrarPorSucursal(this.idSucursalSeleccionada, false);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.pinInput?.nativeElement.focus();
    }, 0);
  }

  onPinValidado(responsable: ResponsableTarea) {
    localStorage.setItem('responsable-tareas', JSON.stringify(responsable));
    this.router.navigate(['/main/home-a']);
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

  validarPin() {
    if (this.pinIngresado.length !== 4) return;

    const responsable = this.taskResponsibleService.buscarPorPin(this.pinIngresado);

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

    this.router.navigate(['/home']);
  }

  cancelar() {
    this.router.navigate(['/auth/login']); // o donde definas
  }

}
