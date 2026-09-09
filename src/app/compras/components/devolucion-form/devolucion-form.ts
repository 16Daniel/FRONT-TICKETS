import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { DevolucionAla } from '../../interfaces/no-conformidad';
import { DevolucionesService } from '../../services/devoluciones.service';
import { ProveedorPlaneacion } from '../../interfaces/ProveedorPlaneacion';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { ToastModule } from "primeng/toast";
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';

@Component({
  selector: 'app-devolucion-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CalendarModule,
    InputTextModule, InputNumberModule, InputTextareaModule,
    ButtonModule, FileUploadModule, ImageModule, DropdownModule,
    ToastModule,FormsModule
],
  templateUrl: './devolucion-form.html'
})
export class DevolucionFormComponent implements OnInit {
  @Input() devolucion: DevolucionAla | null = null;
  @Output() saveCompleted = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Input() proveedores: ProveedorPlaneacion[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() sucursal: string| undefined = '';
  @Input() catStatus:string[] = []; 
  selectedStatus: string = '';
  proveedorSeleccionadoId: number | null = null;
  maxPhotos = 3;
  usuario: Usuario;

  private fb = inject(FormBuilder);
  private devolucionesService = inject(DevolucionesService);

  devForm!: FormGroup;
  selectedFiles: File[] = [];
  existingPhotos: string[] = [];
  isSaving = false;
 
  constructor( private messageService: MessageService){ this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); }
  ngOnInit(): void {
    this.initForm();
    if (this.devolucion) {
      this.loadFormData(this.devolucion);
    }
  }

  private initForm(): void {
    this.devForm = this.fb.group({
      fechaReporte: [new Date(), Validators.required],
      proveedor: ['', Validators.required],
      lote: ['', Validators.required],
      fechaEntrega: [null, Validators.required],
      noFacturaRemision: ['', Validators.required],
      cantidadEntregadaKg: [null, [Validators.required, Validators.min(0)]],
      cantidadRechazadaKg: [null, [Validators.required, Validators.min(0)]],
      color: [''],
      textura: [''],
      olor: [''],
      peso: [''],
      corte: [''],
      estatus: [''],
      sucursal: [this.sucursal]
    });
  }

  private loadFormData(data: DevolucionAla): void {
    this.existingPhotos = data.fotosUrl || [];
    this.devForm.patchValue({
      fechaReporte: data.fechaReporte.toDate(),
      proveedor: data.proveedor,
      lote: data.lote,
      fechaEntrega: data.fechaEntrega.toDate(),
      noFacturaRemision: data.noFacturaRemision,
      cantidadEntregadaKg: data.cantidadEntregadaKg,
      cantidadRechazadaKg: data.cantidadRechazadaKg,
      color: data.motivosRechazo?.color || '',
      textura: data.motivosRechazo?.textura || '',
      olor: data.motivosRechazo?.olor || '',
      corte: data.motivosRechazo?.corte || '',
      estatus: data.estatus || '',
      sucursal: data.sucursal || ''
    });
  }

onSelectFiles(event: any): void {
  const files = Array.from<File>(event.files || []);
  const disponibles = this.maxPhotos - (this.existingPhotos.length + this.selectedFiles.length);

  if (disponibles <= 0) {
    this.showMessage('error', 'Error', 'Ya has alcanzado el límite de 3 imágenes.');
    return;
  }

  const archivosAAgregar = files.slice(0, disponibles);

  if (files.length > disponibles) {
    this.showMessage('info', 'Info', `Solo se agregaron ${disponibles} de ${files.length} imágenes (máximo 3).`);
  }

  this.selectedFiles = [...this.selectedFiles, ...archivosAAgregar];

  // Limpia el input para futuras selecciones
  const input = event.originalEvent?.target as HTMLInputElement;
  if (input) input.value = '';
}

showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  removeExistingPhoto(index: number) {
    this.existingPhotos.splice(index, 1);
  }

  async onSubmit() {
    if (this.devForm.invalid) {
      this.devForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formVal = this.devForm.value;

    const payload: Partial<DevolucionAla> = {
      fechaReporte: formVal.fechaReporte,
      proveedor: formVal.proveedor,
      lote: formVal.lote,
      fechaEntrega: formVal.fechaEntrega,
      noFacturaRemision: formVal.noFacturaRemision,
      cantidadEntregadaKg: formVal.cantidadEntregadaKg,
      cantidadRechazadaKg: formVal.cantidadRechazadaKg,
      motivosRechazo: {
        color: formVal.color,
        textura: formVal.textura,
        olor: formVal.olor,
        corte: formVal.corte
      },
      estatus: formVal.estatus,
      sucursal: formVal.sucursal
    };

    try {
      if (this.devolucion && this.devolucion.id) {
        await this.devolucionesService.updateDevolucion(
          this.devolucion.id, payload, this.selectedFiles, this.existingPhotos
        );
      } else {
        payload.estatus = 'TO DO';
        await this.devolucionesService.createDevolucion(payload as DevolucionAla, this.selectedFiles);
      }
      this.saveCompleted.emit();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      this.isSaving = false;
    }
  }
}