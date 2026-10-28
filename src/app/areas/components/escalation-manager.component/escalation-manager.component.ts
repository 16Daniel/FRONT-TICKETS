import { Component, model, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importaciones de PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { EscalationLevel } from '../../interfaces/escalation-level.interface';
import { GrupoWhatsapp } from '../../interfaces/grupo-whatsapp.interface';
import { ResponsableNivel } from '../../interfaces/responsable-nivel.interface';
import { WhatsappService } from '../../services/whatsapp.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-escalation-manager',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    DividerModule,
    DropdownModule],
  templateUrl: './escalation-manager.component.html',
  styleUrl: './escalation-manager.component.scss',
})
export class EscalationManagerComponent implements OnInit {
 levels = model<EscalationLevel[]>([]);
 gruposWhatsapp = signal<GrupoWhatsapp[]>([]);
 grupoNuevosTickets = model<string>();

 constructor(private whatsappService: WhatsappService){} 

 addLevel() {
    const current = this.levels();
    const newLevelNumber = current.length + 1;
    
    const newEntry: EscalationLevel = {
      id: crypto.randomUUID(),
      level: newLevelNumber,
      responsables: [{ id: crypto.randomUUID(), esgrupo: false, name: '', phone: '' }],
      role: `Escalado Nivel ${newLevelNumber - 1}`
    };

    this.levels.set([...current, newEntry]);
  }

  addResponsable(levelId: string) {
    const updated = this.levels()
      .map(item => {
        if (item.id === levelId) {
          return {
            ...item,
            responsables: [...item.responsables, { id: crypto.randomUUID(), esgrupo: false, name: '', phone: '' }]
          };
        }
        return item;
      });
      
    this.levels.set(updated);
  }

  removeResponsable(levelId: string, responsableId: string) {
    const updated = this.levels()
      .map(item => {
        if (item.id === levelId) {
          return {
            ...item,
            responsables: item.responsables.filter(r => r.id !== responsableId)
          };
        }
        return item;
      });
      
    this.levels.set(updated);
  }

  removeLevel(id: string) {
    const updated = this.levels()
      .filter(item => item.id !== id)
      .map((item, index) => ({
        ...item,
        level: index + 1
      }));
      
    this.levels.set(updated);
  }

  saveConfiguration() {
    console.log('Estructura de escalonamiento guardada:', this.levels());
  }

  ngOnInit(): void { this.obtenerGrupoWhatsapp(); }

  obtenerGrupoWhatsapp(): void {
    this.whatsappService.obtenergrupos().subscribe({
      next: (respuesta: unknown) => {
        try {
          this.gruposWhatsapp.set(this.normalizarGruposWhatsapp(respuesta));
        } catch (error) {
          console.error('La API de WhatsApp devolvió una respuesta de grupos inválida:', error);
        }
      },
      error: (error) => {
        console.error('Error al obtener los grupos de WhatsApp:', error);
      }
    });
  }

  private normalizarGruposWhatsapp(respuesta: unknown): GrupoWhatsapp[] {
    let grupos: unknown = respuesta;

    if (!Array.isArray(grupos) && typeof grupos === 'object' && grupos !== null) {
      const resultado = grupos as Record<string, unknown>;
      grupos = resultado['groups'] ?? resultado['data'] ?? resultado['results'];
    }

    if (!Array.isArray(grupos)) {
      throw new TypeError('Se esperaba una lista de grupos de WhatsApp.');
    }

    return grupos.map((grupo: unknown, indice: number) => {
      if (typeof grupo !== 'object' || grupo === null) {
        throw new TypeError(`El grupo en la posición ${indice} no es válido.`);
      }

      const registro = grupo as Record<string, unknown>;
      const id = registro['id'];
      const name = registro['name'];
      if (typeof id !== 'string' || typeof name !== 'string') {
        throw new TypeError(`El grupo en la posición ${indice} no contiene id y name válidos.`);
      }

      return { id, name };
    });
  }

  onGrupoChange(selectedGroupId: string, itemr: ResponsableNivel): void {
    itemr.name = this.gruposWhatsapp().find(g => g.id === selectedGroupId)?.name || '';
  }

  cambiarGrupoNuevosTickets(grupoId: string): void {
    this.grupoNuevosTickets.set(grupoId);
  }

}
