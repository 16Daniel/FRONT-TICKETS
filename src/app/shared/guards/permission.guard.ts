import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AccessControlService } from '../services/access-control.service';

/**
 * Guard funcional que valida si el rol del usuario cuenta con el permiso de menú requerido.
 * Si no cuenta con el permiso, lo redirige automáticamente a su primera opción de menú permitida.
 * Si su rol no tiene ninguna opción permitida, lo redirige a la pantalla /main/sin-acceso.
 */
export const permissionGuard = (permiso: string | string[]): CanActivateFn => {
  return async (route, state): Promise<boolean | UrlTree> => {
    const accessControl = inject(AccessControlService);
    const router = inject(Router);

    await accessControl.ensureLoaded();

    const tienePermiso = Array.isArray(permiso)
      ? accessControl.canAny(permiso)
      : accessControl.can(permiso);

    if (tienePermiso) {
      return true;
    }

    // Busca la primera ruta permitida para el rol
    const primeraRuta = accessControl.getPrimeraRutaPermitida();

    // Si tiene al menos una ruta permitida y no es la misma que intentó abrir, redirigir a ella
    if (primeraRuta && primeraRuta !== state.url) {
      return router.parseUrl(primeraRuta);
    }

    // Si no tiene ningún menú permitido en absoluto, redirigir a la pantalla de Sin Acceso
    return router.parseUrl('/main/sin-acceso');
  };
};
