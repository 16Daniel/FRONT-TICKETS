import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

import { ModalColorsComponent } from '../../dialogs/modal-colors/modal-colors.component';
import { ModalActivityComponent } from '../../dialogs/modal-activity/modal-activity.component';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Area } from '../../../areas/interfaces/area.model';
import { UsersService } from '../../../usuarios/services/users.service';
import { AreasService } from '../../../areas/services/areas.service';

@Component({
  selector: 'app-visita-filtros-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    ModalColorsComponent,
    ModalActivityComponent,
  ],
  templateUrl: './visita-filtros-toolbar.component.html',
  styleUrl: './visita-filtros-toolbar.component.scss',
})
export class VisitaFiltrosToolbarComponent implements OnInit {
  @Input() usuario!: Usuario;
  @Input() usuarioSeleccionado: Usuario | undefined;
  @Output() usuarioSeleccionadoChange = new EventEmitter<Usuario | undefined>();

  @Input() fecha: Date = new Date();
  @Output() fechaChange = new EventEmitter<Date>();

  @Input() vercalendario: boolean = false;
  @Output() vercalendarioChange = new EventEmitter<boolean>();

  @Input() idArea: string = '1';
  @Output() idAreaChange = new EventEmitter<string>();

  @Output() usuariosHelpLoaded = new EventEmitter<Usuario[]>();
  @Output() filtroChange = new EventEmitter<void>();
  @Output() actividadCreada = new EventEmitter<string>();

  usuariosHelp: Usuario[] = [];
  usuariosHelpDropDown: Usuario[] = [];
  areas: Area[] = [];
  showModalColors: boolean = false;
  mostrarModalActividades: boolean = false;

  constructor(
    private usersService: UsersService,
    private areasService: AreasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerUsuariosHelp();
    this.areasService.areas$.subscribe((areas) => {
      this.areas = areas;
      this.cdr.detectChanges();
    });
  }

  obtenerUsuariosHelp(): void {
    this.usersService.getUsuariosPorRol(['4', '7', '5']).subscribe((usuarios) => {
      this.usuariosHelp = usuarios;
      this.usuariosHelpDropDown = usuarios.filter((u) =>
        this.usuario?.idArea === '1'
          ? ['1', '2'].includes(u.idArea)
          : u.idArea === this.usuario?.idArea
      );
      this.usuariosHelpLoaded.emit(usuarios);
      this.cdr.detectChanges();
    });
  }

  onUsuarioChange(): void {
    this.usuarioSeleccionadoChange.emit(this.usuarioSeleccionado);
    this.filtroChange.emit();
  }

  onFechaSelect(): void {
    this.fechaChange.emit(this.fecha);
    this.filtroChange.emit();
  }

  onAreaChange(): void {
    this.idAreaChange.emit(this.idArea);
  }

  cambiarVista(verCal: boolean): void {
    this.vercalendario = verCal;
    this.vercalendarioChange.emit(verCal);
    if (!verCal) {
      this.filtroChange.emit();
    }
  }

  abrirModalColores(): void {
    this.showModalColors = true;
    this.cdr.detectChanges();
  }

  onAgregarActividad(texto: string): void {
    this.mostrarModalActividades = false;
    this.actividadCreada.emit(texto);
  }

  obtenerNombreArea(idArea: string): string {
    return this.areas.find((a) => a.id === idArea)?.nombre ?? idArea ?? '';
  }
}
