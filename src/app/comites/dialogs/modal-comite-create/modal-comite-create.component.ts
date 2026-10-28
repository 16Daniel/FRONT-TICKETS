import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { AreasService } from '../../../areas/services/areas.service';
import { Responsable } from '../../../usuarios/interfaces/responsable.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { ResponsablesService } from '../../../usuarios/services/responsables.service';
import { UsersService } from '../../../usuarios/services/users.service';
import { Comite } from '../../interfaces/comite';
import { ComitesService } from '../../services/comites.service';
import { Subscription } from 'rxjs';
import { AvatarComponent } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-modal-comite-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, MultiSelectModule, AvatarComponent, TooltipModule],
  templateUrl: './modal-comite-create.component.html',
  styleUrl: './modal-comite-create.component.scss',
})
export class ModalComiteCreateComponent implements OnInit, OnDestroy {
  @Input() mostrarModalCrearComite = false;
  @Input() comite: Comite = new Comite();
  @Input() esNuevoComite = true;
  @Output() closeEvent = new EventEmitter<boolean>();

  idComiteEditar = '';
  guardando = false;
  responsablesFiltrados: Responsable[] = [];

  private usuarios: Usuario[] = [];
  private responsables: Responsable[] = [];
  private subscriptions = new Subscription();

  constructor(
    private comitesService: ComitesService,
    public areasService: AreasService,
    private usersService: UsersService,
    private responsablesService: ResponsablesService,
    private messageService: MessageService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscriptions.add(
      this.usersService.usuarios$.subscribe((usuarios) => {
        this.usuarios = usuarios;
        this.actualizarResponsablesFiltrados();
      }),
    );
    this.subscriptions.add(
      this.responsablesService.responsables$.subscribe((responsables) => {
        this.responsables = responsables;
        this.actualizarResponsablesFiltrados();
      }),
    );

    if (!this.esNuevoComite) {
      this.comite = {
        ...this.comite,
        areas: [...(this.comite.areas ?? [])],
        idsResponsables: [...(this.comite.idsResponsables ?? [])],
        idResponsableLider: this.comite.idResponsableLider ?? '',
      };
      this.idComiteEditar = this.comite.id ?? '';
      this.actualizarResponsablesFiltrados();
      return;
    }

    try {
      this.comite = {
        ...this.comite,
        id: await this.comitesService.obtenerSecuencial(),
        areas: this.comite.areas ?? [],
        idsResponsables: this.comite.idsResponsables ?? [],
        idResponsableLider: this.comite.idResponsableLider ?? '',
        eliminado: false,
      };
      this.actualizarResponsablesFiltrados();
    } catch (error) {
      this.showMessage(
        'error',
        'Error',
        error instanceof Error ? error.message : 'No se pudo obtener el ID del comité.',
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onHide(): void {
    this.closeEvent.emit(false);
  }

  onAreasChange(areas: string[] | null): void {
    this.comite.areas = areas ?? [];
    this.actualizarResponsablesFiltrados();
    const idsDisponibles = new Set(
      this.responsablesFiltrados
        .map((responsable) => responsable.id)
        .filter((id): id is string => Boolean(id)),
    );
    this.comite.idsResponsables = (this.comite.idsResponsables ?? []).filter((id) =>
      idsDisponibles.has(id),
    );
    this.validarLiderSeleccionado();
  }

  onResponsablesChange(idsResponsables: string[] | null): void {
    this.comite.idsResponsables = idsResponsables ?? [];
    this.validarLiderSeleccionado();
  }

  seleccionarLider(responsable: Responsable): void {
    if (responsable.id && this.comite.idsResponsables.includes(responsable.id)) {
      this.comite.idResponsableLider = responsable.id;
    }
  }

  obtenerResponsablesSeleccionados(): Responsable[] {
    const idsSeleccionados = new Set(this.comite.idsResponsables ?? []);
    return this.responsablesFiltrados.filter(
      (responsable) => responsable.id && idsSeleccionados.has(responsable.id),
    );
  }

  async enviar(form: NgForm): Promise<void> {
    if (form.invalid || !this.comite.nombre.trim() || (this.esNuevoComite && !this.comite.id)) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      this.showMessage(
        'error',
        'Error',
        this.esNuevoComite && !this.comite.id
          ? 'No se pudo asignar el ID del comité.'
          : 'Campos requeridos incompletos',
      );
      return;
    }

    this.guardando = true;
    try {
      if (this.esNuevoComite) {
        await this.comitesService.create({
          ...this.comite,
          id: String(this.comite.id),
          nombre: this.comite.nombre.trim(),
          areas: [...(this.comite.areas ?? [])],
          idsResponsables: [...(this.comite.idsResponsables ?? [])],
          idResponsableLider: this.comite.idResponsableLider,
          eliminado: false,
        });
        this.showMessage('success', 'Éxito', 'Comité creado correctamente');
      } else {
        await this.comitesService.update(
          {
            nombre: this.comite.nombre.trim(),
            areas: [...(this.comite.areas ?? [])],
            idsResponsables: [...(this.comite.idsResponsables ?? [])],
            idResponsableLider: this.comite.idResponsableLider,
          },
          this.idComiteEditar,
        );
        this.showMessage('success', 'Éxito', 'Comité actualizado correctamente');
      }

      this.closeEvent.emit(false);
    } catch (error) {
      this.showMessage(
        'error',
        'Error',
        error instanceof Error ? error.message : 'No se pudo guardar el comité.',
      );
    } finally {
      this.guardando = false;
    }
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  private actualizarResponsablesFiltrados(): void {
    const areasSeleccionadas = new Set(
      (this.comite.areas ?? []).map((idArea) => String(idArea)),
    );
    const idsUsuarios = new Set(
      this.usuarios
        .filter((usuario) => areasSeleccionadas.has(String(usuario.idArea)))
        .map((usuario) => String(usuario.id)),
    );

    this.responsablesFiltrados = this.responsables.filter((responsable) =>
      idsUsuarios.has(String(responsable.idUsuario)),
    );
  }

  private validarLiderSeleccionado(): void {
    if (
      this.comite.idResponsableLider &&
      !(this.comite.idsResponsables ?? []).includes(this.comite.idResponsableLider)
    ) {
      this.comite.idResponsableLider = '';
    }
  }

  obtenerAreaResponsable(responsable: Responsable): string {
    const usuario = this.usuarios.find(
      (item) => String(item.id) === String(responsable.idUsuario),
    );
    const area = this.areasService.areas.find(
      (item) => String(item.id) === String(usuario?.idArea),
    );
    return area?.nombre ?? 'Área sin asignar';
  }
}
