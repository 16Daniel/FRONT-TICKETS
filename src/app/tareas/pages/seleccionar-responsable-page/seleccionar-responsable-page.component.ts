import { Component, inject, OnInit } from '@angular/core';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { CommonModule } from '@angular/common';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seleccionar-responsable-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccionar-responsable-page.component.html',
  styleUrl: './seleccionar-responsable-page.component.scss'
})
export default class SeleccionarResponsablePageComponent implements OnInit {
  taskResponsibleService = inject(TaskResponsibleService);

  responsableActivoSeleccionado?: ResponsableTarea | any;
  resposablesDeSucursal: ResponsableTarea[] = [];
  usuario!: Usuario;
  idSucursalSeleccionada: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.idSucursalSeleccionada = this.usuario.sucursales[0].id;

    this.taskResponsibleService.responsables$.subscribe(() => {
      this.resposablesDeSucursal = this.taskResponsibleService.filtrarPorSucursal(this.idSucursalSeleccionada, false);
    });
  }

  onSeleccionar(responsable: ResponsableTarea) {
    localStorage.setItem('responsable-tareas', JSON.stringify(responsable));
    this.router.navigate(['/main/home-a']);
  }
}
