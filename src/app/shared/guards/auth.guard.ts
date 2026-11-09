import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const userData = localStorage.getItem('rwuserdatatk');

    // 1. Validar que exista sesión iniciada
    if (!userData) {
      return this.router.parseUrl('/auth/login');
    }

    // 2. Si ya seleccionó responsable con PIN en turno, permitir acceso
    const responsable = localStorage.getItem('responsable-tareas');
    if (responsable) {
      return true;
    }

    // 3. Permitir navegación hacia la pantalla de selección de responsable sin ciclo infinito
    if (state.url.includes('/usuarios/selecciona-responsable') || state.url.includes('/auth/login')) {
      return true;
    }

    // 4. Todos los usuarios deben seleccionar responsable
    return this.router.parseUrl('/usuarios/selecciona-responsable');
  }
}
