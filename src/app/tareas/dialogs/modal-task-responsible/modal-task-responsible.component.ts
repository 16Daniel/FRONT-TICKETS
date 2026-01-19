import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';
import { ResponsableTarea } from '../../../models/responsable-tarea.model';
import { TaskResponsibleService } from '../../../services/task-responsible.service';
import { AvatarModule } from 'ngx-avatars';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-modal-task-responsible',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TableModule,
    DropdownModule,
    ToastModule,
    AvatarModule,
    InputSwitchModule
  ],
  providers: [MessageService],
  templateUrl: './modal-task-responsible.component.html',
  styleUrl: './modal-task-responsible.component.scss'
})
export class ModalTaskResponsibleComponent implements OnInit, OnDestroy {

  @Input() mostrarModal = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  sucursales: Sucursal[] = [];
  sucursalesMap = new Map<string, string>();
  responsables: ResponsableTarea[] = [];
  idSucursalSeleccionada: string | null = null;

  cargando = false;
  private subs = new Subscription();

  nuevoResponsable: ResponsableTarea = new ResponsableTarea;

  constructor(
    private branchesService: BranchesService,
    private responsablesService: TaskResponsibleService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subs.add(
      this.branchesService.get().subscribe({
        next: (data) => {
          this.sucursales = data;

          this.sucursalesMap.clear();
          data.forEach(s =>
            this.sucursalesMap.set(s.id!, s.nombre)
          );

          this.cdr.detectChanges();
        }
      })
    );

    this.subs.add(
      this.responsablesService.responsables$.subscribe(r => {
        this.responsables = r;
        this.aplicarFiltro();
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.invalid || this.cargando) return;

    this.cargando = true;
console.log({...this.nuevoResponsable})
    try {
      await this.responsablesService.create({...this.nuevoResponsable});
      this.messageService.add({
        severity: 'success',
        summary: 'Correcto',
        detail: 'Responsable creado'
      });

      form.resetForm();
      this.nuevoResponsable.idSucursal = this.idSucursalSeleccionada!;

    } finally {
      this.cargando = false;
    }
  }

  onSucursalChange(id: string) {
    this.idSucursalSeleccionada = id;
    this.aplicarFiltro();
  }

  private aplicarFiltro() {
    this.responsables =
      this.responsablesService.filtrarPorSucursal(this.idSucursalSeleccionada);
  }

  activarEdicion(res: any) {
    res.editando = true;
  }

  async guardarCambios(res: any) {
    res.editando = false;
    if (!res.id) return;

    await this.responsablesService.update(res, res.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Cambios guardados'
    });
  }


  async eliminar(res: ResponsableTarea) {
    if (!res.id) return;

    const result = await Swal.fire({
      title: '¿Eliminar responsable?',
      text: `El responsable "${res.nombre}" será movido a eliminados`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      customClass: {
        container: 'swal-topmost'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await this.responsablesService.delete(res.id);

      Swal.fire({
        icon: 'success',
        title: 'Responsable eliminado',
        text: `"${res.nombre}" fue eliminado correctamente`,
        timer: 1400,
        showConfirmButton: false,
        customClass: {
          container: 'swal-topmost'
        }
      });

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el responsable. Intenta nuevamente.'
      });
    }
  }
}
