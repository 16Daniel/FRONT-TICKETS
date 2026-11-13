import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { buildFirebaseSwUrl } from './fcm.service';

declare global {
  interface Window {
    __deferredPwaPrompt?: any;
  }
}

const SESSION_DISMISS_KEY = 'rw_pwa_banner_dismissed_session';
const UPDATE_CHECK_INTERVAL_MS = 60 * 1000; // Revisar cada 60 segundos

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private deferredPrompt: any = null;

  private readonly showInstallBannerSubject = new BehaviorSubject<boolean>(false);
  public readonly showInstallBanner$ = this.showInstallBannerSubject.asObservable();

  private readonly canPromptNativelySubject = new BehaviorSubject<boolean>(false);
  public readonly canPromptNatively$ = this.canPromptNativelySubject.asObservable();

  private readonly updateAvailableSubject = new BehaviorSubject<boolean>(false);
  public readonly updateAvailable$ = this.updateAvailableSubject.asObservable();

  private readonly isUpdatingSubject = new BehaviorSubject<boolean>(false);
  public readonly isUpdating$ = this.isUpdatingSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.ensureServiceWorkerRegistered();
    this.initInstallListeners();
    this.initServiceWorkerUpdates();
  }

  private getSwPath(): string {
    return buildFirebaseSwUrl();
  }

  private ensureServiceWorkerRegistered(): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register(this.getSwPath())
      .then((reg) => {
        this.monitorRegistrationForUpdates(reg);
      })
      .catch(() => {});
  }

  private monitorRegistrationForUpdates(reg: ServiceWorkerRegistration): void {
    if (reg.waiting) {
      this.ngZone.run(() => {
        this.updateAvailableSubject.next(true);
      });
    }

    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.ngZone.run(() => {
            this.updateAvailableSubject.next(true);
          });
        }
      });
    });
  }

  private initInstallListeners(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('rw_pwa_banner_dismissed_at');

    if (this.isStandalone()) {
      this.showInstallBannerSubject.next(false);
      return;
    }

    if (window.__deferredPwaPrompt) {
      this.deferredPrompt = window.__deferredPwaPrompt;
      this.canPromptNativelySubject.next(true);
    }

    if (!this.isBannerDismissedInSession()) {
      this.showInstallBannerSubject.next(true);
    }

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.ngZone.run(() => {
        this.deferredPrompt = event;
        window.__deferredPwaPrompt = event;
        this.canPromptNativelySubject.next(true);
        if (!this.isStandalone() && !this.isBannerDismissedInSession()) {
          this.showInstallBannerSubject.next(true);
        }
      });
    });

    window.addEventListener('appinstalled', () => {
      this.ngZone.run(() => {
        this.deferredPrompt = null;
        window.__deferredPwaPrompt = null;
        this.canPromptNativelySubject.next(false);
        this.showInstallBannerSubject.next(false);
      });
    });
  }

  private initServiceWorkerUpdates(): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          this.ngZone.run(() => {
            this.updateAvailableSubject.next(true);
          });
        }
      });

      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.verificarActualizacionEnSw();
          }
        });
      }

      this.ngZone.runOutsideAngular(() => {
        setInterval(() => {
          this.verificarActualizacionEnSw();
        }, UPDATE_CHECK_INTERVAL_MS);
      });
    }
  }

  public async verificarActualizacionEnSw(): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        this.monitorRegistrationForUpdates(reg);
        if (reg.waiting) {
          this.ngZone.run(() => {
            this.updateAvailableSubject.next(true);
          });
        }
        if (reg.active) {
          reg.active.postMessage({ type: 'SW_CHECK_UPDATE' });
        }
      }
    } catch {
      // Ignorar errores de red al consultar actualizaciones
    }
  }

  public isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (window.navigator as any).standalone === true;
    return isStandaloneMedia || isIosStandalone;
  }

  public isIos(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return isIosDevice || isIpadOs;
  }

  private isBannerDismissedInSession(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESSION_DISMISS_KEY) === 'true';
  }

  public descartarBannerInstalacion(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_DISMISS_KEY, 'true');
    }
    this.showInstallBannerSubject.next(false);
  }

  private waitForDeferredPrompt(timeoutMs: number = 2500): Promise<any> {
    const existing = this.deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPwaPrompt : null);
    if (existing) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve) => {
      let resolved = false;
      const onPrompt = (event: Event) => {
        event.preventDefault();
        if (resolved) return;
        resolved = true;
        window.removeEventListener('beforeinstallprompt', onPrompt);
        this.deferredPrompt = event;
        window.__deferredPwaPrompt = event;
        this.canPromptNativelySubject.next(true);
        resolve(event);
      };

      window.addEventListener('beforeinstallprompt', onPrompt);

      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        window.removeEventListener('beforeinstallprompt', onPrompt);
        resolve(this.deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPwaPrompt : null));
      }, timeoutMs);
    });
  }

  public async instalarApp(logoUrl: string = 'assets/images/Logo_REBEL_Vertical_1024x1024.PNG'): Promise<void> {
    if (this.isIos()) {
      await Swal.fire({
        imageUrl: logoUrl,
        imageWidth: 72,
        imageHeight: 72,
        imageAlt: 'REBEL TICKETS',
        title: '<span style="color: #1E1E24; font-weight: 800; font-size: 20px;">Instalar REBEL TICKETS</span>',
        html: `
          <div style="text-align: left; font-size: 14px; color: #334155; line-height: 1.6;">
            <p style="margin-bottom: 10px;">Para instalar <b>REBEL TICKETS</b> en tu iPhone o iPad:</p>
            <ol style="padding-left: 20px; margin: 0;">
              <li>Toca el botón <b>Compartir</b> <i class="bx bx-export" style="font-size: 16px; color: #D3152A;"></i> en la barra de Safari.</li>
              <li>Desliza hacia abajo y selecciona <b>"Agregar a pantalla de inicio"</b>.</li>
              <li>Pulsa <b>Agregar</b> en la esquina superior derecha.</li>
            </ol>
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#D3152A',
      });
      return;
    }

    this.ensureServiceWorkerRegistered();
    const promptEvent = await this.waitForDeferredPrompt(1800);

    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        if (typeof window !== 'undefined') {
          window.__deferredPwaPrompt = null;
        }
        this.canPromptNativelySubject.next(false);
        this.showInstallBannerSubject.next(false);
      }
    }
  }

  public async actualizarApp(): Promise<void> {
    if (this.isUpdatingSubject.value) return;
    this.isUpdatingSubject.next(true);

    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.update();
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        } catch {
          // Ignorar errores al actualizar registros de SW
        }
      }

      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
        } catch {
          // Ignorar errores al limpiar Cache Storage
        }
      }
    } finally {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  }
}
