import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { ProveedorPlaneacion } from '../../interfaces/ProveedorPlaneacion';
import { MessageService } from 'primeng/api';
import { PlaneacionCatService } from '../../services/planeacion.service';
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { DropdownModule } from "primeng/dropdown";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-catalogo-proveedores-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, TableModule, DropdownModule,ButtonModule,ToastModule],
  providers:[MessageService],
  templateUrl: './catalogo-proveedores-tickets.html',
  styleUrl: './catalogo-proveedores-tickets.scss',
})
export class CatalogoProveedoresTickets implements OnInit {
  @Input() visible: boolean = false;    
  @Input() modulo: string = '';          
  @Output() visibleChange = new EventEmitter<boolean>();

  // Lista de proveedores asociados al módulo (tabla)
  proveedores: ProveedorPlaneacion[] = [];

  // Proveedores seleccionados en la tabla
  selectedProveedores: ProveedorPlaneacion[] = [];

  // Lista completa de proveedores para el desplegable
  allProveedores: ProveedorPlaneacion[] = [];

  // Proveedor seleccionado en el desplegable
  selectedProveedorParaAgregar: ProveedorPlaneacion | null = null;

  loading: boolean = false;

  constructor(
    private service: PlaneacionCatService,
    private messageService: MessageService,
    public cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Cargar todos los proveedores al iniciar (para el desplegable)
    this.cargarTodosProveedores();
  }

  ngOnChanges(): void {
    // Cuando se abre el diálogo (visible cambia a true) cargamos los datos del módulo
    if (this.visible && this.modulo) {
      this.cargarProveedoresDelModulo();
    }
  }

  // Carga los proveedores del módulo
  cargarProveedoresDelModulo(): void {
    this.loading = true;
    this.service.getProveedoresPorModulo(this.modulo).subscribe({
      next: (data) => {
        this.proveedores = data;
        this.loading = false;
        this.cdr.detectChanges(); 
        this.limpiarSeleccion();
      },
      error: (err) => {
        this.loading = false;
        this.messageService?.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proveedores' });
        console.error(err);
      }
    });
  }

  // Carga todos los proveedores (para el dropdown)
  cargarTodosProveedores(): void {
    this.service.getAllProveedores().subscribe({
      next: (data) => {
        this.allProveedores = data;
        this.cdr.detectChanges(); 
        // Opcional: filtrar los que ya están en el módulo para que no aparezcan en el dropdown
        this.actualizarListaDisponible();
      },
      error: (err) => {
        console.error('Error cargando todos los proveedores', err);
      }
    });
  }

  // Filtra la lista de todos los proveedores para mostrar solo los que NO están ya en la tabla
  get proveedoresDisponibles(): ProveedorPlaneacion[] {
    const idsEnModulo = new Set(this.proveedores.map(p => p.codproveedor));
    return this.allProveedores.filter(p => !idsEnModulo.has(p.codproveedor));
  }

  // Actualiza la selección del dropdown después de cambios
  actualizarListaDisponible(): void {
    // Forzar actualización de la lista (el getter ya lo hace)
    // Si el selectedProveedorParaAgregar ya no es válido, lo limpiamos
    if (this.selectedProveedorParaAgregar) {
      const disponible = this.proveedoresDisponibles.some(p => p.codproveedor === this.selectedProveedorParaAgregar?.codproveedor);
      if (!disponible) {
        this.selectedProveedorParaAgregar = null;
      }
    }
  }

  // Agregar proveedor seleccionado del dropdown
  agregarProveedor(): void {
    if (!this.selectedProveedorParaAgregar) {
      this.messageService?.add({ severity: 'warn', summary: 'Advertencia', detail: 'Selecciona un proveedor' });
      return;
    }
    const id = this.selectedProveedorParaAgregar.codproveedor;
    this.loading = true;
    this.service.agregarProveedores([id], this.modulo).subscribe({
      next: () => {
        this.messageService?.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor agregado' });
        // Recargar la tabla
        this.cargarProveedoresDelModulo();
        // Limpiar selección del dropdown
        this.selectedProveedorParaAgregar = null;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.loading = false;
        this.messageService?.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar' });
        console.error(err);
      }
    });
  }

  // Eliminar los proveedores seleccionados en la tabla
  eliminarSeleccionados(): void {
    if (!this.selectedProveedores || this.selectedProveedores.length === 0) {
      this.messageService?.add({ severity: 'warn', summary: 'Advertencia', detail: 'Selecciona al menos un proveedor' });
      return;
    }
    const ids = this.selectedProveedores.map(p => p.codproveedor);
    this.loading = true;
    this.service.borrarProveedores(ids, this.modulo).subscribe({
      next: () => {
        this.messageService?.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedores eliminados' });
        this.cargarProveedoresDelModulo();
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.loading = false;
        this.messageService?.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron eliminar' });
        console.error(err);
      }
    });
  }

  limpiarSeleccion(): void {
    this.selectedProveedores = [];
  }

  cerrarDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.limpiarSeleccion();
  }
}
