import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Area } from '../../../areas/models/area.model';
import { Usuario } from '../../../usuarios/models/usuario.model';

@Component({
  selector: 'app-admin-area-grouping-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-area-grouping-panel.component.html',
  styleUrl: './admin-area-grouping-panel.component.scss'
})
export class AdminAreaGroupingPanelComponent {
  @Input() esVistaGlobal = false;
  @Input() areas: Area[] = [];
  @Input() usuarios: Usuario[] = [];

  @Output() verTodos = new EventEmitter<void>();
  @Output() seleccionarUsuario = new EventEmitter<Usuario>();

  areaSeleccionada?: Area;

  get usuariosDeAreaSeleccionada(): Usuario[] {
    if (this.areaSeleccionada?.id == null) return [];

    return this.usuarios.filter(usuario =>
      String(usuario.idArea) === String(this.areaSeleccionada!.id)
    );
  }

  seleccionarArea(area: Area): void {
    this.areaSeleccionada = area;
  }

  volverAListaAreas(): void {
    this.areaSeleccionada = undefined;
  }

  obtenerInicialesUsuario(usuario: Usuario): string {
    const partesNombre = `${usuario.nombre || ''} ${usuario.apellidoP || ''}`
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return partesNombre.slice(0, 2).map(parte => parte.charAt(0).toUpperCase()).join('') || '?';
  }
}
