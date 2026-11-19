import Swal, { SweetAlertResult } from 'sweetalert2';

export interface SwalRwLoadingOptions {
  badge?: string;
  title?: string;
  text?: string;
}

export interface SwalRwAlertOptions {
  variant?: 'critical' | 'info';
  badge?: string;
  badgeIcon?: string;
  icon?: string;
  title: string;
  htmlMessage: string;
  callout?: string;
  confirmButtonText?: string;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
}

export const SwalRw = {
  loading(options: SwalRwLoadingOptions = {}): Promise<SweetAlertResult<any>> {
    const badge = options.badge ?? 'Procesando';
    const title = options.title ?? 'Cargando información';
    const text = options.text ?? 'Espere por favor...';

    return Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      html: `
        <div class="swal-rw-loading-body">
          <div class="swal-rw-spinner-wrap">
            <span class="swal-rw-spinner" aria-hidden="true"></span>
          </div>
          <span class="swal-rw-badge is-info">
            <i class="bx bx-loader-circle"></i> ${badge}
          </span>
          <h3 class="swal-rw-title">${title}</h3>
          <p class="swal-rw-desc">${text}</p>
        </div>
      `,
      customClass: {
        container: 'swal-topmost',
        popup: 'swal-rw-popup is-loading'
      }
    });
  },

  alert(options: SwalRwAlertOptions): Promise<SweetAlertResult<any>> {
    const variantClass = options.variant === 'info' ? 'is-info' : 'is-critical';
    const icon = options.icon ?? (options.variant === 'info' ? 'bx-info-circle' : 'bx-lock-alt');
    const badgeIcon = options.badgeIcon ?? (options.variant === 'info' ? 'bx-info-circle' : 'bx-shield-x');
    const badgeHtml = options.badge
      ? `<span class="swal-rw-badge ${variantClass}"><i class="bx ${badgeIcon}"></i> ${options.badge}</span>`
      : '';
    const calloutHtml = options.callout
      ? `
        <div class="swal-rw-callout">
          <i class="bx bx-info-circle"></i>
          <span>${options.callout}</span>
        </div>
      `
      : '';

    return Swal.fire({
      target: document.body,
      allowOutsideClick: options.allowOutsideClick ?? false,
      allowEscapeKey: options.allowEscapeKey ?? false,
      buttonsStyling: false,
      html: `
        <div class="swal-rw-body">
          <div class="swal-rw-header-row">
            <div class="swal-rw-icon-box ${variantClass}">
              <i class="bx ${icon}"></i>
            </div>
            <div>
              ${badgeHtml}
              <h3 class="swal-rw-title">${options.title}</h3>
            </div>
          </div>
          <p class="swal-rw-desc">${options.htmlMessage}</p>
          ${calloutHtml}
        </div>
      `,
      confirmButtonText: options.confirmButtonText ?? 'ENTENDIDO',
      customClass: {
        container: 'swal-topmost',
        popup: 'swal-rw-popup',
        actions: 'swal-rw-actions',
        confirmButton: 'swal-rw-confirm-btn'
      }
    });
  },

  close(): void {
    Swal.close();
  }
};
