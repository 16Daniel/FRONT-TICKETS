import { Component, input, model, type OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importaciones de PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { EscalationLevel, GrupoWhatsapp, ResponsableNivel } from '../../interfaces/area.model';
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
      next: (grupos) => {
        this.gruposWhatsapp.set(grupos);
        console.log('Grupos de WhatsApp obtenidos:', grupos);
      },
      error: (error) => {
        console.error('Error al obtener los grupos de WhatsApp:', error);
      }
    });
  }

  onGrupoChange(event: any, itemr: ResponsableNivel): void {
    debugger
    const selectedGroupId = event.value;
    itemr.name = this.gruposWhatsapp().find(g => g.id === selectedGroupId)?.name || '';
  }

  cambiarGrupoNuevosTickets(event: any): void {
    debugger
    this.grupoNuevosTickets.set(event.value);
  }

}
