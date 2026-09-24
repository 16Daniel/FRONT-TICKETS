import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { AvatarModule } from 'ngx-avatars';
// Importamos p-editor de primeng temporalmente para simular el rich text
import { EditorModule } from 'primeng/editor';

import { Bitacora } from '../../interfaces/bitacora.model';
import { BitacoraService } from '../../services/bitacora.service';
import { ResponsableTarea } from '../../../tareas/interfaces/responsable-tarea.interface';
import { DatesHelperService } from '../../helpers/dates-helper.service';

import 'quill-mention';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarModule, EditorModule],
  templateUrl: './bitacora.component.html',
  styleUrl: './bitacora.component.scss'
})
export class BitacoraComponent implements OnInit, OnDestroy {
  @Input() modulo!: string;
  @Input() referenciaId!: string;
  @Input() usuariosEtiquetables: ResponsableTarea[] = [];
  
  // Usuario actual (simulado o inyectado después)
  @Input() usuarioActual!: ResponsableTarea | any;

  bitacoras: Bitacora[] = [];
  nuevoMensaje: string = '';
  cargando: boolean = true;
  
  // Configuración de módulos de Quill
  editorModules = {
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@'],
      source: (searchTerm: string, renderList: (matches: any[], searchTerm: string) => void, mentionChar: string) => {
        let values = this.usuariosEtiquetables.map(u => ({ id: u.id, value: u.nombre }));
        if (searchTerm.length === 0) {
          renderList(values, searchTerm);
        } else {
          const matches = values.filter(v => v.value.toLowerCase().includes(searchTerm.toLowerCase()));
          renderList(matches, searchTerm);
        }
      }
    }
  };

  private sub: Subscription | null = null;

  constructor(
    private bitacoraService: BitacoraService,
    public datesHelper: DatesHelperService
  ) {}

  ngOnInit() {
    if (this.modulo && this.referenciaId) {
      this.cargarBitacoras();
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  cargarBitacoras() {
    this.cargando = true;
    this.sub = this.bitacoraService.getBitacoras(this.modulo, this.referenciaId)
      .subscribe({
        next: (data) => {
          this.bitacoras = data;
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar bitácora:', err);
          this.cargando = false;
        }
      });
  }

  enviarComentario() {
    if (!this.nuevoMensaje || this.nuevoMensaje.trim() === '') return;
    
    // Fallback por si no pasan un usuario actual o si pasan Usuario model
    const currentId = this.usuarioActual?.id || 'default';
    let currentName = this.usuarioActual?.nombre || 'Usuario Actual';
    
    // Si es del tipo Usuario tiene apellidoP
    if ((this.usuarioActual as any)?.apellidoP) {
      currentName += ' ' + (this.usuarioActual as any).apellidoP;
    }

    const nuevaBitacora: Bitacora = {
      modulo: this.modulo,
      referenciaId: this.referenciaId,
      tipo: 'COMENTARIO',
      contenido: this.nuevoMensaje,
      autor: {
        id: currentId,
        nombre: currentName,
        color: this.usuarioActual?.color || '#64748B'
      },
      fechaCreacion: Timestamp.now(),
      usuariosEtiquetados: [] // Por ahora vacío hasta integrar quill-mention bien
    };

    this.bitacoraService.addEntrada(nuevaBitacora).then(() => {
      this.nuevoMensaje = '';
    });
  }
}
