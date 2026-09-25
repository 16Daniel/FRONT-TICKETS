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
import { MentionUtils } from '../../utils/mention.utils';

import Quill from 'quill';
import { Mention, MentionBlot } from 'quill-mention';

Quill.register({ 'blots/mention': MentionBlot, 'modules/mention': Mention });
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
  @Input() usuarioActual!: ResponsableTarea;

  bitacoras: Bitacora[] = [];
  nuevoMensaje: string = '';
  cargando: boolean = true;
  
  // Configuración de módulos de Quill
  editorModules = {
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@'],
      source: (searchTerm: string, renderList: (matches: any[], searchTerm: string) => void, mentionChar: string) => {
        const getInitials = (name: string) => {
          if (!name) return '?';
          const parts = name.split(' ').filter(p => p.length > 0);
          if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
          return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        };

        const values = this.usuariosEtiquetables.map(u => ({ 
          id: u.id, 
          value: u.nombre,
          color: u.color,
          posicion: u.posicion,
          initials: getInitials(u.nombre)
        }));
        
        console.log('Quill Mention Source Triggered. Search:', searchTerm, 'Values available:', values.length);
        if (searchTerm.length === 0) {
          renderList(values, searchTerm);
        } else {
          const matches = values.filter(v => v.value.toLowerCase().includes(searchTerm.toLowerCase()));
          renderList(matches, searchTerm);
        }
      },
      renderItem: (item: any, searchTerm: string) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '10px';
        div.style.padding = '4px 0';
        
        const avatarStr = `
          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${item.color || '#94a3b8'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0;">
            ${item.initials}
          </div>
          <div style="display: flex; flex-direction: column; line-height: 1.2;">
            <span style="font-size: 14px; font-weight: 600; color: #334155;">${item.value}</span>
            <span style="font-size: 11px; color: #64748b;">${item.posicion || 'Sin área'}</span>
          </div>
        `;
        div.innerHTML = avatarStr;
        return div;
      }
    }
  };

  private sub: Subscription | null = null;

  constructor(
    private bitacoraService: BitacoraService,
    public datesHelper: DatesHelperService
  ) {}

  ngOnInit() {
    if (!this.usuarioActual) {
      const storedResponsable = localStorage.getItem('responsable-tareas');
      if (storedResponsable) {
        this.usuarioActual = JSON.parse(storedResponsable);
      }
    }

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
          // Invertimos el arreglo para mostrar los más recientes primero (descendente)
          this.bitacoras = data ? data.slice().reverse() : [];
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
    
    // Obtener el responsable actual
    const currentId = this.usuarioActual?.id || 'default';
    const currentName = this.usuarioActual?.nombre || 'Usuario Actual';
    const currentColor = this.usuarioActual?.color || '#94a3b8';

    const usuariosEtiquetados = MentionUtils.extraerUsuariosEtiquetados(this.nuevoMensaje);

    const nuevaBitacora: Bitacora = {
      modulo: this.modulo,
      referenciaId: this.referenciaId,
      tipo: 'COMENTARIO',
      contenido: this.nuevoMensaje,
      autor: {
        id: currentId,
        nombre: currentName,
        color: currentColor
      },
      fechaCreacion: Timestamp.now(),
      usuariosEtiquetados: usuariosEtiquetados
    };

    this.bitacoraService.addEntrada(nuevaBitacora).then(() => {
      this.nuevoMensaje = '';
    });
  }
}
