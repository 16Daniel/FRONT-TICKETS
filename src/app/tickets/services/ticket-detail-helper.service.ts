import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { BitacoraService } from '../../shared/services/bitacora.service';
import { ComitesService } from './comites.service';
import { Comite } from '../models/comite.model';

@Injectable({
  providedIn: 'root',
})
export class TicketDetailHelperService {
  constructor(
    private bitacoraService: BitacoraService,
    private comitesService: ComitesService
  ) {}

  obtenerNombreComite(idComite: string): string {
    const comite = this.comitesService.comites.find(
      (item: Comite) => String(item.id) === String(idComite)
    );
    return comite?.nombre ?? idComite;
  }

  async registrarBitacoraSistema(ticketId: string, contenido: string): Promise<void> {
    if (!ticketId) return;
    let responsable: any = null;
    const rawResp = localStorage.getItem('responsable-tareas');
    if (rawResp) {
      responsable = JSON.parse(rawResp);
    }
    const bitacoraEntry: any = {
      modulo: 'TICKETS',
      referenciaId: ticketId,
      tipo: 'SISTEMA',
      contenido,
      autor: {
        id: responsable?.id || 'SISTEMA',
        nombre: responsable?.nombre || 'Sistema',
        color: responsable?.color || '#94a3b8',
      },
      fechaCreacion: Timestamp.now(),
    };
    await this.bitacoraService.addEntrada(bitacoraEntry);
  }

  async mostrarSwalMitigacion(): Promise<{ comentario: string; fecha: string } | null> {
    const result = await Swal.fire({
      title: 'Mitigación de Ticket',
      html: `
        <div class="text-start" style="font-family: inherit;">
          <label class="form-label fw-bold mb-1" style="font-size: 0.9rem;">Comentario Breve:</label>
          <textarea id="mitigacion-comentario" class="form-control mb-3" rows="3" placeholder="Ingrese el motivo o comentario de mitigación..." style="border-radius: 8px;"></textarea>
          
          <label class="form-label fw-bold mb-1" style="font-size: 0.9rem;">Fecha Estimada:</label>
          <input type="date" id="mitigacion-fecha" class="form-control" style="border-radius: 8px;">
        </div>
      `,
      width: '500px',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText: 'Guardar Mitigación',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost',
      },
      preConfirm: () => {
        const comentario = (document.getElementById('mitigacion-comentario') as HTMLTextAreaElement).value.trim();
        const fecha = (document.getElementById('mitigacion-fecha') as HTMLInputElement).value;
        if (!comentario) {
          Swal.showValidationMessage('El comentario es requerido');
          return false;
        }
        if (!fecha) {
          Swal.showValidationMessage('La fecha estimada es requerida');
          return false;
        }
        return { comentario, fecha };
      },
    });

    if (result.isConfirmed && result.value) {
      return result.value;
    }
    return null;
  }

  async mostrarSwalRechazo(): Promise<string | null> {
    const result = await Swal.fire({
      title: 'Rechazar Soporte',
      html: `
        <div class="text-start" style="font-family: inherit;">
          <p class="text-muted mb-2" style="font-size: 0.9rem;">
            El estado del ticket regresará a <b>POR RESOLVER</b>.
          </p>
          <label class="form-label fw-bold mb-1" style="font-size: 0.9rem;">Motivo de rechazo:</label>
          <textarea id="rechazo-motivo" class="form-control" rows="3" placeholder="Ingrese el motivo por el cual rechaza el soporte..." style="border-radius: 8px;"></textarea>
        </div>
      `,
      width: '500px',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText: 'Rechazar Soporte',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost',
      },
      preConfirm: () => {
        const motivo = (document.getElementById('rechazo-motivo') as HTMLTextAreaElement)?.value.trim();
        if (!motivo) {
          Swal.showValidationMessage('El motivo de rechazo es requerido');
          return false;
        }
        return motivo;
      },
    });

    if (result.isConfirmed && result.value) {
      return result.value;
    }
    return null;
  }

  async mostrarSwalCalificacion(
    title: string,
    message: string,
    confirmButtonText: string
  ): Promise<number | null> {
    const etiquetas: Record<number, string> = {
      1: 'Malo',
      2: 'Regular',
      3: 'Bueno',
      4: 'Muy bueno',
      5: 'Excelente',
    };

    const result = await Swal.fire({
      target: document.body,
      title,
      html: `
        <style>
          .rw-star-rating-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.9rem;
            padding: 0.5rem 0 0.25rem;
          }
          .rw-rating-message {
            margin: 0;
            font-size: 0.92rem;
            color: #475569;
            line-height: 1.45;
          }
          .rw-rating-prompt {
            margin: 0.25rem 0 0;
            font-size: 1rem;
            font-weight: 700;
            color: #1e1e24;
          }
          .rw-stars-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.55rem;
            padding: 0.35rem 0.75rem;
          }
          .rw-star-item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 2.75rem;
            line-height: 1;
            color: #cbd5e1;
            transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), color 0.16s ease, filter 0.16s ease;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          .rw-star-item.is-filled {
            color: #fdb813;
            filter: drop-shadow(0 3px 8px rgba(253, 184, 19, 0.35));
          }
          .rw-star-item.is-hovered {
            transform: scale(1.18) translateY(-2px);
          }
          .rw-star-item.is-pop {
            animation: rwStarPop 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .rw-star-item:focus-visible {
            outline: 2px solid #fdb813;
            outline-offset: 4px;
            border-radius: 8px;
          }
          .rw-rating-feedback {
            min-height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.3rem 0.95rem;
            border-radius: 999px;
            font-size: 0.85rem;
            font-weight: 700;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #64748b;
            transition: all 0.18s ease;
          }
          .rw-rating-feedback.has-value {
            background: #fffbeb;
            border-color: #fde68a;
            color: #b45309;
          }
          @keyframes rwStarPop {
            0% { transform: scale(1); }
            50% { transform: scale(1.26); }
            100% { transform: scale(1); }
          }
        </style>
        <div class="rw-star-rating-box">
          <p class="rw-rating-message">${message}</p>
          <p class="rw-rating-prompt">¿Cómo calificarías la atención recibida?</p>
          <div class="rw-stars-row" id="rw-stars-row" role="radiogroup" aria-label="Calificación con estrellas">
            ${[1, 2, 3, 4, 5]
              .map(
                (n) => `
                  <span
                    class="rw-star-item"
                    data-value="${n}"
                    role="radio"
                    aria-checked="false"
                    aria-label="${n} ${n === 1 ? 'estrella' : 'estrellas'} - ${etiquetas[n]}"
                    tabindex="0">
                    <i class="bx bxs-star"></i>
                  </span>
                `
              )
              .join('')}
          </div>
          <div class="rw-rating-feedback" id="rw-rating-feedback">
            Toca una estrella para calificar
          </div>
          <input type="hidden" id="rating-value" value="" />
        </div>
      `,
      width: '480px',
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost',
      },
      didOpen: (popup) => {
        const starsRow = popup.querySelector('#rw-stars-row');
        const stars = Array.from(popup.querySelectorAll('.rw-star-item')) as HTMLElement[];
        const feedback = popup.querySelector('#rw-rating-feedback') as HTMLElement | null;
        const input = popup.querySelector('#rating-value') as HTMLInputElement | null;
        let selectedRating = 0;

        const renderStars = (activeRating: number, hoveredRating = 0) => {
          stars.forEach((star) => {
            const val = Number(star.getAttribute('data-value') || 0);
            star.classList.toggle('is-filled', val <= activeRating);
            star.classList.toggle('is-hovered', hoveredRating > 0 && val <= hoveredRating);
            star.setAttribute('aria-checked', String(selectedRating > 0 && val === selectedRating));
          });

          if (feedback) {
            if (activeRating > 0) {
              feedback.textContent = `${activeRating} / 5 · ${etiquetas[activeRating]}`;
              feedback.classList.add('has-value');
            } else {
              feedback.textContent = 'Toca una estrella para calificar';
              feedback.classList.remove('has-value');
            }
          }
        };

        const selectRating = (value: number) => {
          selectedRating = value;
          if (input) {
            input.value = String(value);
          }
          renderStars(selectedRating);
          stars.forEach((star) => {
            const val = Number(star.getAttribute('data-value') || 0);
            if (val <= value) {
              star.classList.remove('is-pop');
              void star.offsetWidth;
              star.classList.add('is-pop');
            }
          });
          Swal.resetValidationMessage();
        };

        stars.forEach((star) => {
          const val = Number(star.getAttribute('data-value') || 0);

          star.addEventListener('mouseenter', () => {
            renderStars(val, val);
          });

          star.addEventListener('click', () => {
            selectRating(val);
          });

          star.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              selectRating(val);
            } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault();
              const next = Math.min(5, (selectedRating || val) + 1);
              selectRating(next);
              stars[next - 1]?.focus();
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault();
              const prev = Math.max(1, (selectedRating || val) - 1);
              selectRating(prev);
              stars[prev - 1]?.focus();
            }
          });
        });

        starsRow?.addEventListener('mouseleave', () => {
          renderStars(selectedRating, 0);
        });
      },
      preConfirm: () => {
        const val = (document.getElementById('rating-value') as HTMLInputElement)?.value;
        if (!val) {
          Swal.showValidationMessage('Debes seleccionar una calificación para continuar');
          return false;
        }
        return Number(val);
      },
    });

    if (result.isConfirmed && result.value) {
      return Number(result.value);
    }
    return null;
  }

  async mostrarSwalConfirmacion(title: string, text: string): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost',
      },
    });
    return !!result.isConfirmed;
  }

  async mostrarSwalAgregarComite(
    comitesDisponibles: Comite[],
    comitesSeleccionados: string[]
  ): Promise<string[] | null> {
    const seleccionadosSet = new Set<string>((comitesSeleccionados ?? []).map(String));

    const opcionesHtml =
      comitesDisponibles.length > 0
        ? comitesDisponibles
            .map((c) => {
              const idStr = String(c.id);
              const isChecked = seleccionadosSet.has(idStr);
              return `
            <label class="swal-comite-item ${isChecked ? 'selected' : ''}" data-nombre="${(c.nombre || '').toLowerCase()}" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid ${isChecked ? '#D3152A' : '#e2e8f0'}; background: ${isChecked ? '#FFF1F2' : '#ffffff'}; border-radius: 8px; cursor: pointer; margin-bottom: 6px; transition: all 0.15s ease;">
              <input type="checkbox" class="swal-comite-checkbox form-check-input m-0" value="${idStr}" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
              <span style="font-size: 0.9rem; font-weight: 600; color: #1e293b;">${c.nombre}</span>
            </label>
          `;
            })
            .join('')
        : `<div class="text-center text-muted py-3" style="font-size: 0.9rem;">No hay comités registrados</div>`;

    const result = await Swal.fire({
      title: 'Agregar a Comité',
      html: `
        <div class="text-start" style="font-family: inherit;">
          <label class="form-label fw-bold mb-2" style="font-size: 0.9rem;">Selecciona uno o más comités:</label>
          <input type="text" id="swal-comite-search" class="form-control mb-2" placeholder="Buscar comité..." style="border-radius: 8px; font-size: 0.88rem;">
          <div id="swal-comites-list" style="max-height: 240px; overflow-y: auto; padding-right: 4px;">
            ${opcionesHtml}
          </div>
        </div>
      `,
      width: '500px',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText: 'Guardar Comités',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost',
      },
      didOpen: () => {
        const searchInput = document.getElementById('swal-comite-search') as HTMLInputElement;
        const items = document.querySelectorAll('.swal-comite-item');
        items.forEach((item) => {
          const checkbox = item.querySelector('.swal-comite-checkbox') as HTMLInputElement;
          checkbox?.addEventListener('change', () => {
            const el = item as HTMLElement;
            if (checkbox.checked) {
              el.classList.add('selected');
              el.style.borderColor = '#D3152A';
              el.style.background = '#FFF1F2';
            } else {
              el.classList.remove('selected');
              el.style.borderColor = '#e2e8f0';
              el.style.background = '#ffffff';
            }
          });
        });

        searchInput?.addEventListener('input', () => {
          const term = searchInput.value.trim().toLowerCase();
          items.forEach((item) => {
            const el = item as HTMLElement;
            const nombre = el.getAttribute('data-nombre') || '';
            el.style.display = nombre.includes(term) ? 'flex' : 'none';
          });
        });
      },
      preConfirm: () => {
        const checked = Array.from(
          document.querySelectorAll('.swal-comite-checkbox:checked')
        ) as HTMLInputElement[];
        return checked.map((cb) => cb.value);
      },
    });

    if (result.isConfirmed && Array.isArray(result.value)) {
      return result.value;
    }
    return null;
  }
}
