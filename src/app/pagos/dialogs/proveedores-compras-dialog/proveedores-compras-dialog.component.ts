import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { Proveedor } from '../../interfaces/AdministracionCompra';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { ProveedoresService } from '../../services/Proveedores.service';

@Component({
  selector: 'app-proveedores-compras-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, TableModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './proveedores-compras-dialog.component.html',
  styleUrl: './proveedores-compras-dialog.component.scss',
})
export class ProveedoresComprasDialogComponent implements OnInit {
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() visible: boolean = false;
  proveedores: Proveedor[] = [];
  public usuario: Usuario;
  public nuevoProveedor: Proveedor = {
    id: undefined,
    razonSocial: '',
    cuenta: '',
    cuentaInterbancaria: '',
    banco: '',
    rfc: '',
    idUsuario: '',
    idArea: null,
  };

  constructor(
    private proveedoresService: ProveedoresService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  ngOnInit(): void {
    this.nuevoProveedor.idUsuario = this.usuario.id;
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.proveedoresService.getProveedoresUsuario(this.usuario.id).subscribe((data) => {
      this.proveedores = data;
    });
  }

  agregarProveedor(): void {
    if (this.nuevoProveedor.id === undefined) {
      this.proveedoresService
        .createProveedor(this.nuevoProveedor)
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Proveedor registrado correctamente',
          });
          this.resetForm();
        })
        .catch((error) => console.error('Error al agregar proveedor:', error));
    } else {
      this.actualizarProveedor(this.nuevoProveedor);
    }
  }

  actualizarProveedor(proveedor: Proveedor): void {
    if (proveedor.id) {
      this.proveedoresService
        .updateProveedor(proveedor.id, proveedor)
        .then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Proveedor actualizado correctamente',
          });
          this.resetForm();
        })
        .catch((error) => console.error('Error al actualizar proveedor:', error));
    }
  }

  confirmarEliminar(id: string): void {
    this.confirmationService.confirm({
      header: '¿Eliminar proveedor?',
      message: '¿Está seguro que desea eliminar este proveedor?',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Volver',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'btn-confirm-accept',
      rejectButtonStyleClass: 'btn-confirm-reject',
      accept: () => {
        this.eliminarProveedor(id);
      },
      reject: () => {},
    });
  }

  eliminarProveedor(id: string): void {
    this.proveedoresService
      .deleteProveedor(id)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Proveedor eliminado correctamente',
        });
      })
      .catch((error) => console.error('Error al eliminar proveedor:', error));
  }

  onHide() {
    this.closeEvent.emit(false);
  }

  editar(proveedor: Proveedor) {
    this.nuevoProveedor = { ...proveedor };
  }

  cancelar() {
    this.resetForm();
  }

  private resetForm() {
    this.nuevoProveedor = {
      id: undefined,
      razonSocial: '',
      cuenta: '',
      cuentaInterbancaria: '',
      banco: '',
      rfc: '',
      idUsuario: this.usuario.id,
      idArea: this.usuario.idArea,
    };
  }
}
