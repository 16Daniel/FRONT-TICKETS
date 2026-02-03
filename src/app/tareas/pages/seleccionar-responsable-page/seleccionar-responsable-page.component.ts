import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { CommonModule } from '@angular/common';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Router } from '@angular/router';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';
import { ModalValidarPinComponent } from '../../dialogs/modal-validar-pin/modal-validar-pin.component';

@Component({
  selector: 'app-seleccionar-responsable-page',
  standalone: true,
  imports: [CommonModule, AvatarModule, TooltipModule, ModalValidarPinComponent],
  templateUrl: './seleccionar-responsable-page.component.html',
  styleUrl: './seleccionar-responsable-page.component.scss'
})
export default class SeleccionarResponsablePageComponent implements OnInit {
  taskResponsibleService = inject(TaskResponsibleService);

  responsableActivoSeleccionado?: ResponsableTarea | any;
  resposablesDeSucursal: ResponsableTarea[] = [];
  usuario!: Usuario;
  idSucursalSeleccionada: string = '';

  @ViewChild(ModalValidarPinComponent)
  modalPin!: ModalValidarPinComponent;

  constructor(private router: Router) { }

  ngOnInit(): void {
    localStorage.removeItem('responsable-tareas');

    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursalSeleccionada = this.usuario.sucursales[0].id;

    this.taskResponsibleService.responsables$.subscribe(() => {
      this.resposablesDeSucursal = this.taskResponsibleService.filtrarPorSucursal(this.idSucursalSeleccionada, false);
    });
  }

  onSeleccionar(responsable: ResponsableTarea) {
    this.modalPin.abrirModalPin(responsable);
  }

  onPinValidado(responsable: ResponsableTarea) {
    localStorage.setItem('responsable-tareas', JSON.stringify(responsable));
    this.router.navigate(['/main/home-a']);
  }
}
