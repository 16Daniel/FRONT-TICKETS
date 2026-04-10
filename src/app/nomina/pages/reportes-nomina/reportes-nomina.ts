import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { TablaChecadasManuales } from "../../components/tabla-checadas-manuales/tabla-checadas-manuales";
import { TablaTurnosLargos } from "../../components/tabla-turnos-largos/tabla-turnos-largos";
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-reportes-nomina',
  standalone: true,
  imports: [CommonModule, TabViewModule, TablaChecadasManuales, TablaTurnosLargos],
  templateUrl: './reportes-nomina.html',
  styleUrl: './reportes-nomina.scss',
})
export default class ReportesNomina implements OnInit {
  ngOnInit(): void { }

}
