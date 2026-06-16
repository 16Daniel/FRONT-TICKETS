import { Component, type OnInit } from '@angular/core';
import { ClientesDelivery } from '../../interfaces/diccionariodelivery';
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
import { InputNumberModule } from "primeng/inputnumber";

@Component({
  selector: 'app-tab-clientes-delivery',
  standalone: true,
  imports: [TableModule, DialogModule, ConfirmDialogModule, ToastModule, ButtonModule, InputTextModule, FormsModule, CommonModule, ToolbarModule, InputNumberModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tab-clientes-delivery.html',
  styleUrl: './tab-clientes-delivery.scss',
})
export class TabClientesDelivery implements OnInit {
  clientes: ClientesDelivery[] = [];
  cliente!: ClientesDelivery;
  clienteDialog: boolean = false;
  submitted: boolean = false;

  constructor(
    private clientesService:DiccionariodeliveryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() {
    this.clientesService.getClientes().subscribe({
      next: (data) => this.clientes = data,
      error: () => this.messageService.add({ 
        severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los clientes', life: 3000 
      })
    });
  }

  openNew() {
    this.cliente = { marca: '', plataforma: '', codcliente: 0, diseñoTicket: '' };
    this.submitted = false;
    this.clienteDialog = true;
  }

  editCliente(cliente: ClientesDelivery) {
    this.cliente = { ...cliente };
    this.clienteDialog = true;
  }

  deleteCliente(cliente: ClientesDelivery) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar al cliente con código ${cliente.codcliente}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if (cliente.id) {
          this.clientesService.eliminarCliente(cliente.id).subscribe({
            next: () => {
              this.clientes = this.clientes.filter(val => val.id !== cliente.id);
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente eliminado correctamente', life: 3000 });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el cliente', life: 3000 })
          });
        }
      }
    });
  }

  hideDialog() {
    this.clienteDialog = false;
    this.submitted = false;
  }

  saveCliente() {
    this.submitted = true;

    // Validación elemental de campos obligatorios
    if (this.cliente.marca?.trim() && this.cliente.plataforma?.trim() && this.cliente.codcliente) {
      if (this.cliente.id) {
        // Modo Edición
        this.clientesService.updateCliente(this.cliente).subscribe({
          next: () => {
            const index = this.clientes.findIndex(c => c.id === this.cliente.id);
            this.clientes[index] = this.cliente;
            this.clientes = [...this.clientes];
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado', life: 3000 });
            this.clienteDialog = false;
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar cliente', life: 3000 })
        });
      } else {
        // Modo Creación
        this.clientesService.agregarCliente(this.cliente).subscribe({
          next: () => {
            this.cargarClientes(); // Recargamos la lista completa para reflejar el ID asignado por BD
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente registrado con éxito', life: 3000 });
            this.clienteDialog = false;
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al registrar cliente', life: 3000 })
        });
      }
    }
  }

}
