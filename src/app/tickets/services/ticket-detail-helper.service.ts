import { Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { BitacoraService } from '../../shared/services/bitacora.service';
import { ComitesService } from '../../comites/services/comites.service';
import { Comite } from '../../comites/interfaces/comite';

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

  async mostrarSwalCalificacion(
    title: string,
    message: string,
    confirmButtonText: string
  ): Promise<number | null> {
    const result = await Swal.fire({
      title,
      html: `
        <style>
          .rating-container { display: flex; justify-content: center; gap: 8px; margin-top: 20px; flex-wrap: wrap; }
          .rating-option { 
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            cursor: pointer; padding: 12px 8px; border: 2px solid #e2e8f0; border-radius: 12px; 
            transition: all 0.2s ease; flex: 1; min-width: 70px; background: #ffffff;
          }
          .rating-option:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-2px); }
          .rating-option.selected { border-color: #D3152A; background: #FFF1F2; box-shadow: 0 4px 6px -1px rgba(211, 21, 42, 0.1); }
          .rating-stars { font-size: 1.2rem; line-height: 1; margin-bottom: 8px; color: #cbd5e1; letter-spacing: 1px; display: flex; }
          .rating-option:hover .rating-stars { color: #FDB813; }
          .rating-option.selected .rating-stars { color: #FDB813; }
          .rating-text { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; text-align: center; }
          .rating-option.selected .rating-text { color: #D3152A; font-weight: 800; }
        </style>
        <p class="text-muted" style="font-size: 0.95rem; margin-bottom: 5px;">${message}</p>
        <p class="text-dark fw-bold m-0 mt-3" style="font-size: 1.05rem;">Por favor, califica la atención recibida:</p>
        <div class="rating-container" id="custom-rating">
          <div class="rating-option" data-value="1">
            <div class="rating-stars">★</div>
            <div class="rating-text">Malo</div>
          </div>
          <div class="rating-option" data-value="2">
            <div class="rating-stars">★★</div>
            <div class="rating-text">Regular</div>
          </div>
          <div class="rating-option" data-value="3">
            <div class="rating-stars">★★★</div>
            <div class="rating-text">Bueno</div>
          </div>
          <div class="rating-option" data-value="4">
            <div class="rating-stars">★★★★</div>
            <div class="rating-text">Muy<br>Bueno</div>
          </div>
          <div class="rating-option" data-value="5">
            <div class="rating-stars">★★★★★</div>
            <div class="rating-text">Excelente</div>
          </div>
        </div>
        <input type="hidden" id="rating-value" value="">
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonColor: '#D3152A',
      cancelButtonColor: '#1E1E24',
      confirmButtonText,
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-topmost',
      },
      didOpen: () => {
        const options = document.querySelectorAll('.rating-option');
        const input = document.getElementById('rating-value') as HTMLInputElement;
        options.forEach((opt) => {
          opt.addEventListener('click', () => {
            options.forEach((o) => o.classList.remove('selected'));
            opt.classList.add('selected');
            input.value = opt.getAttribute('data-value') || '';
            Swal.resetValidationMessage();
          });
        });
      },
      preConfirm: () => {
        const val = (document.getElementById('rating-value') as HTMLInputElement).value;
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
