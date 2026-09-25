import { Component, model, type OnInit } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importaciones de PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { EscalationLevel } from '../../interfaces/area.model';

@Component({
  selector: 'app-escalation-manager',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    DividerModule],
  templateUrl: './escalation-manager.component.html',
  styleUrl: './escalation-manager.component.scss',
})
export class EscalationManagerComponent implements OnInit {
 levels = model<EscalationLevel[]>([]);

 addLevel() {
    const current = this.levels();
    const newLevelNumber = current.length + 1;
    
    const newEntry: EscalationLevel = {
      id: crypto.randomUUID(),
      level: newLevelNumber,
      name: '',
      phone: '',
      role: `Escalado Nivel ${newLevelNumber - 1}`
    };
    
    this.levels.set([...current, newEntry]);
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

  ngOnInit(): void {}
}
