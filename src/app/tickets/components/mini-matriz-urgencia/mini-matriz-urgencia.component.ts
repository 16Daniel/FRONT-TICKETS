import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { Ticket } from '../../interfaces/ticket.model';

@Component({
  selector: 'app-mini-matriz-urgencia',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './mini-matriz-urgencia.component.html',
  styleUrl: './mini-matriz-urgencia.component.scss'
})
export class MiniMatrizUrgenciaComponent {
  @Input() ticket: Ticket | any;
  @Input() categorias: any[] = [];

  readonly celdasMatriz = [
    { impacto: 3, urgencia: 3 }, { impacto: 3, urgencia: 2 }, { impacto: 3, urgencia: 1 },
    { impacto: 2, urgencia: 3 }, { impacto: 2, urgencia: 2 }, { impacto: 2, urgencia: 1 },
    { impacto: 1, urgencia: 3 }, { impacto: 1, urgencia: 2 }, { impacto: 1, urgencia: 1 }
  ];

  obtenerCoordenadasTicket(tk: Ticket | any): { impacto: number; urgencia: number; score: number; prioridad: string } {
    if (!tk) return { impacto: 2, urgencia: 2, score: 4, prioridad: 'Medio' };
    const critRaw = tk.criticidad;
    const urgRaw = tk.urgencia;
    const scoreRaw = tk.score;

    if (critRaw && urgRaw) {
      const urgencia = Math.min(3, Math.max(1, urgRaw));
      let score = scoreRaw || (critRaw * urgencia);
      if (score > 9) score = 9;
      let impacto = critRaw;
      if (impacto > 3) {
        impacto = Math.round(score / urgencia);
      }
      impacto = Math.min(3, Math.max(1, impacto || 2));
      const prioridad = tk.prioridad || this.clasificarPrioridad(score);
      return { impacto, urgencia, score, prioridad };
    }

    if (scoreRaw) {
      const score = Math.min(9, Math.max(1, scoreRaw));
      const urgencia = Math.min(3, Math.max(1, urgRaw || 2));
      const impacto = Math.min(3, Math.max(1, Math.round(score / urgencia)));
      const prioridad = tk.prioridad || this.clasificarPrioridad(score);
      return { impacto, urgencia, score, prioridad };
    }

    const legacyPrioridad = (tk as any).prioridad;
    if (legacyPrioridad) {
      const p = String(legacyPrioridad).toUpperCase();
      if (p.includes('CRÍT') || p.includes('CRIT') || p.includes('PÁN') || p.includes('PAN')) {
        return { impacto: 3, urgencia: 3, score: 9, prioridad: 'Crítico' };
      }
      if (p.includes('ALT')) {
        return { impacto: 3, urgencia: 2, score: 6, prioridad: 'Alto' };
      }
      if (p.includes('MED')) {
        return { impacto: 2, urgencia: 2, score: 4, prioridad: 'Medio' };
      }
      if (p.includes('BAJ')) {
        return { impacto: 1, urgencia: 2, score: 2, prioridad: 'Bajo' };
      }
    }

    if (tk.idCategoria && this.categorias && this.categorias.length) {
      const cat = this.categorias.find(c => String(c.id) === String(tk.idCategoria));
      if (cat) {
        if (tk.idSubcategoria && cat.subcategorias) {
          const sub = this.buscarSubcategoriaRecursiva(cat.subcategorias, String(tk.idSubcategoria));
          if (sub && (sub.criticidad || sub.score)) {
            const urg = Math.min(3, Math.max(1, sub.urgencia || 2));
            const sc = sub.score || ((sub.criticidad || 2) * urg);
            let imp = sub.criticidad && sub.criticidad <= 3 ? sub.criticidad : Math.round(sc / urg);
            imp = Math.min(3, Math.max(1, imp));
            return {
              impacto: imp,
              urgencia: urg,
              score: sc,
              prioridad: sub.prioridadUrgencia || (sub as any).prioridad || this.clasificarPrioridad(sc)
            };
          }
        }
        if (cat.criticidad || cat.score) {
          const urg = Math.min(3, Math.max(1, cat.urgencia || 2));
          const sc = cat.score || ((cat.criticidad || 2) * urg);
          let imp = cat.criticidad && cat.criticidad <= 3 ? cat.criticidad : Math.round(sc / urg);
          imp = Math.min(3, Math.max(1, imp));
          return {
            impacto: imp,
            urgencia: urg,
            score: sc,
            prioridad: cat.prioridad || this.clasificarPrioridad(sc)
          };
        }
      }
    }

    const fallback = (tk as any).idPrioridadTicket;
    if (fallback === '1') return { impacto: 3, urgencia: 3, score: 9, prioridad: 'Crítico' };
    if (fallback === '2') return { impacto: 3, urgencia: 2, score: 6, prioridad: 'Alto' };
    if (fallback === '3') return { impacto: 2, urgencia: 2, score: 4, prioridad: 'Medio' };
    if (fallback === '4') return { impacto: 1, urgencia: 2, score: 2, prioridad: 'Bajo' };

    return { impacto: 2, urgencia: 2, score: 4, prioridad: 'Medio' };
  }

  clasificarPrioridad(score: number): string {
    if (score >= 7) return 'Crítico';
    if (score >= 5) return 'Alto';
    if (score >= 3) return 'Medio';
    return 'Bajo';
  }

  esCeldaActiva(tk: Ticket | any, imp: number, urg: number): boolean {
    if (!tk) return false;
    const coord = this.obtenerCoordenadasTicket(tk);
    return coord.impacto === imp && coord.urgencia === urg;
  }

  obtenerColorMatriz(tk: Ticket | any): string {
    if (!tk) return '';
    const coord = this.obtenerCoordenadasTicket(tk);
    switch (coord.prioridad) {
      case 'Crítico': return '#EF4444';
      case 'Alto': return '#EA580C';
      case 'Medio': return '#EAB308';
      case 'Bajo': return '#10B981';
      default: return '#3B82F6';
    }
  }

  obtenerTooltipMatriz(tk: Ticket | any): string {
    if (!tk) return '';
    const coord = this.obtenerCoordenadasTicket(tk);
    const scoreGlobal = tk.score ? ` · Score Global: ${tk.score}` : '';
    return `Urgencia (Inicio): Criticidad ${coord.impacto} × Urgencia ${coord.urgencia} (Score: ${coord.score}) — Prioridad: ${coord.prioridad}${scoreGlobal}`;
  }

  buscarSubcategoriaRecursiva(subcategorias: any[], idBuscado: string): any | null {
    if (!subcategorias || !subcategorias.length) return null;
    for (const sub of subcategorias) {
      if (String(sub.id) === idBuscado) return sub;
      if (sub.subcategorias && sub.subcategorias.length > 0) {
        const found = this.buscarSubcategoriaRecursiva(sub.subcategorias, idBuscado);
        if (found) return found;
      }
    }
    return null;
  }
}
