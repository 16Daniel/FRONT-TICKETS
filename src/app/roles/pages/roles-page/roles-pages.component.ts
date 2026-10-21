import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RolesService } from '../../services/roles.service';
import { Rol } from '../../interfaces/rol.model';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    PageHeaderComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles-page.component.html',
  styleUrl: './roles-page.component.scss',
})
export default class RolesPageComponent implements OnInit, OnDestroy {
  public catroles: Rol[] = [];
  public loading: boolean = true;
  public modalAgregar: boolean = false;
  public actualizar: boolean = false;
  public guardando: boolean = false;
  public formdescripcion: string = '';
  public rolsel: Rol | undefined;

  private rolesSub?: Subscription;

  constructor(
    private messageService: MessageService,
    public cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private rolesService: RolesService
  ) { }

  ngOnInit(): void {
    this.getRoles();
  }

  ngOnDestroy(): void {
    this.rolesSub?.unsubscribe();
  }

  getRoles(): void {
    this.loading = true;
    this.rolesSub?.unsubscribe();
    this.rolesSub = this.rolesService.get().subscribe({
      next: (data) => {
        // Ordenar por ID numérico ascendente si es posible
        this.catroles = (data || []).sort((a, b) => {
          const numA = parseInt(a.id, 10);
          const numB = parseInt(b.id, 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return (a.nombre || '').localeCompare(b.nombre || '');
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener catálogo de roles:', error);
        this.loading = false;
        this.showMessage('error', 'Error', 'Error al cargar los roles');
        this.cdr.detectChanges();
      },
    });
  }

  showAgregar(): void {
    this.actualizar = false;
    this.rolsel = undefined;
    this.formdescripcion = '';
    this.modalAgregar = true;
  }

  showEdit(rol: Rol): void {
    this.actualizar = true;
    this.rolsel = rol;
    this.formdescripcion = rol.nombre || '';
    this.modalAgregar = true;
  }

  cerrarModal(): void {
    this.modalAgregar = false;
    this.rolsel = undefined;
    this.formdescripcion = '';
    this.guardando = false;
  }

  async guardar(): Promise<void> {
    const nombre = this.formdescripcion.trim().toUpperCase();
    if (!nombre) {
      this.showMessage('warn', 'Atención', 'Por favor ingresa el nombre del rol');
      return;
    }

    this.guardando = true;

    try {
      if (this.actualizar && this.rolsel) {
        await this.rolesService.update({ nombre }, this.rolsel.id);
        this.showMessage('success', 'Éxito', 'Rol actualizado correctamente');
      } else {
        await this.rolesService.create({ nombre });
        this.showMessage('success', 'Éxito', 'Rol creado correctamente');
      }
      this.cerrarModal();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al guardar rol:', error);
      this.showMessage('error', 'Error', 'Ocurrió un error al guardar el rol');
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  confirm(id: string | number): void {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar este rol?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.deleteRol(id);
      },
      reject: () => { },
    });
  }

  async deleteRol(id: string | number): Promise<void> {
    try {
      await this.rolesService.delete(id);
      this.showMessage('success', 'Éxito', 'Rol eliminado correctamente');
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      this.showMessage('error', 'Error', 'Error al eliminar el rol');
    }
  }

  showMessage(sev: string, summ: string, det: string): void {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
