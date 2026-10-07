import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-umbral-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, MultiSelectModule],
  templateUrl: './umbral-filtros.component.html',
  styleUrl: './umbral-filtros.component.scss'
})
export class UmbralFiltrosComponent implements OnInit {
  @Input() sucursales: any[] = [];
  @Input() usuariosRol4: any[] = [];
  @Input() isApplyingFilters: boolean = false;
  
  @Input() initialFechaInicio: Date | null = null;
  @Input() initialFechaFin: Date | null = null;

  @Output() apply = new EventEmitter<any>();

  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  sucursalesSeleccionadas: any[] = [];
  usuariosSeleccionados: any[] = [];

  ngOnInit() {
    this.fechaInicio = this.initialFechaInicio;
    this.fechaFin = this.initialFechaFin;
  }

  onApply() {
    this.apply.emit({
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      sucursalesSeleccionadas: this.sucursalesSeleccionadas,
      usuariosSeleccionados: this.usuariosSeleccionados
    });
  }
}
