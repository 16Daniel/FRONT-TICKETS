import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

import { Proveedor } from '../../interfaces/AdministracionCompra';
import { Usuario } from '../../../usuarios/models/usuario.model';
import { ProveedoresService } from '../../services/Proveedores.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, TableModule],
  templateUrl: './proveedores.component.html',
})
export class ProveedoresComponent implements OnInit {
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
    idArea: null
  };

  constructor(private proveedoresService: ProveedoresService) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  ngOnInit(): void {
    this.nuevoProveedor.idUsuario = this.usuario.id;
    this.proveedoresService.getProveedoresUsuario(this.usuario.id).subscribe(data => {
      this.proveedores = data;
    });
  }

  agregarProveedor(): void {
    if (this.nuevoProveedor.id == undefined) {
      this.proveedoresService.createProveedor(this.nuevoProveedor)
        .then(() => {
          console.log('Proveedor agregado');
          this.nuevoProveedor = {
            id: undefined,
            razonSocial: '',
            cuenta: '',
            cuentaInterbancaria: '',
            banco: '',
            rfc: '',
            idUsuario: this.usuario.id,
            idArea: this.usuario.idArea
          };

          // Swal.fire({
          //   title: "Success!",
          //   text: "Guardado correctamente!",
          //   icon: "success"
          // });

        })
        .catch(error => console.error('Error al agregar proveedor:', error));
    } else {
      this.actualizarProveedor(this.nuevoProveedor);
    }
  }

  actualizarProveedor(proveedor: Proveedor): void {
    if (proveedor.id) {
      this.proveedoresService.updateProveedor(proveedor.id, proveedor)
        .then(() => {
          this.nuevoProveedor = {
            id: undefined,
            razonSocial: '',
            cuenta: '',
            cuentaInterbancaria: '',
            banco: '',
            rfc: '',
            idUsuario: this.usuario.id,
            idArea: this.usuario.idArea
          };
        })
        .catch(error => console.error('Error al actualizar proveedor:', error));
    }
  }

  eliminarProveedor(id: string): void {
    this.proveedoresService.deleteProveedor(id)
      .then(() => console.log('Proveedor eliminado'))
      .catch(error => console.error('Error al eliminar proveedor:', error));
  }

  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }

  editar(proveedor: Proveedor) {
    this.nuevoProveedor = { ...proveedor };
  }

  cancelar() {
    this.nuevoProveedor = {
      id: undefined,
      razonSocial: '',
      cuenta: '',
      cuentaInterbancaria: '',
      banco: '',
      rfc: '',
      idUsuario: this.usuario.id,
      idArea: this.usuario.idArea
    };
  }
}
