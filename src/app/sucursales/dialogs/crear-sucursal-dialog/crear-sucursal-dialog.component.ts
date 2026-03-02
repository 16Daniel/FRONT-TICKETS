import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';

import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../interfaces/sucursal.interface';
import { Dispositivo } from '../../../activos-fijos/interfaces/dispositivo.interface';

@Component({
  selector: 'app-crear-sucursal-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputNumberModule],
  templateUrl: './crear-sucursal-dialog.component.html',
  styleUrl: './crear-sucursal-dialog.component.scss'
})

export class CrearSucursalDialogComponent implements OnInit {
  @Input() mostrarModalCrearSucursal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() sucursal: Sucursal | any;
  @Input() esNuevaSucursal: boolean = true;
  idSucursalEditar: string = '';
  usuario: Usuario;
  cantidadTVs: number = 0;
  cantidadBocinas: number = 0;
  cantidadTabletas: number = 0;
  cantidadTPVs: number = 0;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private branchesService: BranchesService
  ) { this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }

  async ngOnInit() {
    if (!this.esNuevaSucursal) {
      this.idSucursalEditar = this.sucursal.id;
      if (this.sucursal?.tvs) this.cantidadTVs = this.sucursal.tvs.length;
      if (this.sucursal?.bocinas) this.cantidadBocinas = this.sucursal.bocinas.length;
      if (!this.sucursal.tabletas) this.sucursal.tabletas = [];
      if (!this.sucursal.tpvs) this.sucursal.tpvs = [];
      if (!this.sucursal.tabletasRequeridas) this.sucursal.tabletasRequeridas = 0;
      if (!this.sucursal.tpvsRequeridos) this.sucursal.tpvsRequeridos = 0;
    }

    if (this.esNuevaSucursal) {
      this.sucursal.id = await this.branchesService.obtenerSecuencial();
      this.cdr.detectChanges();
    }

    this.cantidadTabletas = this.sucursal.tabletas?.length || 0;
    this.cantidadTPVs = this.sucursal.tpvs?.length || 0;
  }

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
    if (form.form.status == 'INVALID') {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
      });

      this.showMessage('error', 'Error', 'Campos requeridos incompletos');
      return;
    }

    // console.log(this.sucursal)
    this.esNuevaSucursal ? this.crear() : this.actualizar();
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  async crear() {
    this.sucursal = { ...this.sucursal, id: parseInt(this.sucursal.id) }
    try {
      await this.branchesService.create({ ...this.sucursal });
      this.cdr.detectChanges();
      this.closeEvent.emit(false); // Cerrar modal
      this.showMessage('success', 'Success', 'Guardado correctamente');

    } catch (error: any) {
      this.showMessage('error', 'Error', error.message);
    }
  }

  actualizar() {
    this.sucursal = { ...this.sucursal, id: parseInt(this.sucursal.id) }
    // console.log(this.sucursal)
    this.branchesService
      .update(this.sucursal, this.idSucursalEditar)
      .then(() => {
        this.cdr.detectChanges();
        this.closeEvent.emit(false); // Cerrar modal
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error: any) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  esMantenimientoActivo(sucursal: Sucursal): boolean {
    const activo = Array.isArray(sucursal.activoMantenimientos)
      ? sucursal.activoMantenimientos
      : [];

    return activo.includes(this.usuario.idArea);
  }

  toggleMantenimiento(sucursal: Sucursal): void {
    if (!Array.isArray(sucursal.activoMantenimientos)) {
      sucursal.activoMantenimientos = [];
    }

    const index = sucursal.activoMantenimientos.indexOf(this.usuario.idArea);

    if (index > -1) {
      sucursal.activoMantenimientos.splice(index, 1);
    } else {
      sucursal.activoMantenimientos.push(this.usuario.idArea);
    }
  }

  onTabletasChange(cantidad: number) {
    while (this.sucursal.tabletas.length < cantidad) {
      this.sucursal.tabletas.push(new Dispositivo());
    }
    while (this.sucursal.tabletas.length > cantidad) {
      this.sucursal.tabletas.pop();
    }
  }

  onTPVsChange(cantidad: number) {
    while (this.sucursal.tpvs.length < cantidad) {
      this.sucursal.tpvs.push(new Dispositivo());
    }
    while (this.sucursal.tpvs.length > cantidad) {
      this.sucursal.tpvs.pop();
    }
  }

  onTVsChange(cantidad: number) {

    if (!this.sucursal.tvs) this.sucursal.tvs = [];

    while (this.sucursal.tvs.length < cantidad) {
      this.sucursal.tvs.push({
        id: crypto.randomUUID(),
        nombre: '',
        estatus: '1',
        eliminado: false
      });
    }

    while (this.sucursal.tvs.length > cantidad) {
      this.sucursal.tvs.pop();
    }
  }

  onBocinasChange(cantidad: number) {

    if (!this.sucursal.bocinas) this.sucursal.bocinas = [];

    while (this.sucursal.bocinas.length < cantidad) {
      this.sucursal.bocinas.push({
        id: crypto.randomUUID(),
        nombre: '',
        estatus: '1',
        eliminado: false
      });
    }

    while (this.sucursal.bocinas.length > cantidad) {
      this.sucursal.bocinas.pop();
    }
  }
}
