import { Component, type OnInit } from '@angular/core';
import { CatMarcasDelivery } from '../../interfaces/diccionariodelivery';
import { DiccionariodeliveryService } from '../../services/diccionariodelivery.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
@Component({
  selector: 'app-tab-cat-marcas-delivery',
  standalone: true,
  imports: [TableModule,DialogModule,ConfirmDialogModule,ToastModule,ButtonModule,InputTextModule,FormsModule,CommonModule,ToolbarModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tab-cat-marcas-delivery.html',
  styleUrl: './tab-cat-marcas-delivery.scss',
})
export class TabCatMarcasDelivery implements OnInit {
marcas: CatMarcasDelivery[] = [];
  marca!: CatMarcasDelivery;
  marcaDialog: boolean = false;
  submitted: boolean = false;

  constructor(
    private catMarcasService: DiccionariodeliveryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarMarcas();
  }

  cargarMarcas() {
    this.catMarcasService.getMarcasDelivery().subscribe({
      next: (data) => this.marcas = data,
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las marcas', life: 3000 })
    });
  }

  openNew() {
    this.marca = { nombre: '' };
    this.submitted = false;
    this.marcaDialog = true;
  }

  editMarca(marca: CatMarcasDelivery) {
    this.marca = { ...marca }; // Clonar el objeto para no editar directamente en la tabla
    this.marcaDialog = true;
  }

  deleteMarca(marca: CatMarcasDelivery) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que quieres eliminar ' + marca.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if(marca.id) {
          this.catMarcasService.eliminarCatMarcas(marca.id).subscribe({
            next: () => {
              this.marcas = this.marcas.filter(val => val.id !== marca.id);
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Marca Eliminada', life: 3000 });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la marca', life: 3000 })
          });
        }
      }
    });
  }

  hideDialog() {
    this.marcaDialog = false;
    this.submitted = false;
  }

  saveMarca() {
    this.submitted = true;

    if (this.marca.nombre?.trim()) {
      if (this.marca.id) {
        // Actualizar
        this.catMarcasService.updateCatMarcas(this.marca).subscribe({
          next: () => {
            const index = this.marcas.findIndex(m => m.id === this.marca.id);
            this.marcas[index] = this.marca;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Marca Actualizada', life: 3000 });
            this.marcas = [...this.marcas];
            this.marcaDialog = false;
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar', life: 3000 })
        });
      } else {
        // Crear
        this.catMarcasService.agregarCatMarcas(this.marca).subscribe({
          next: () => {
            this.cargarMarcas(); // Recargamos para obtener el ID generado por la BD
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Marca Creada', life: 3000 });
            this.marcaDialog = false;
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear', life: 3000 })
        });
      }
    }
  }
  
}
