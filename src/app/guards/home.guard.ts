import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class HomeGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userData = localStorage.getItem('rwuserdatatk');
    if (!userData) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const user = JSON.parse(userData);
    const userRole = user.idRol;
    
    // Definir rutas permitidas por rol
    const roleRoutes: { [key: string]: string } = {
      '1': '/main/home-a',
      '2': '/main/home',
      '3': '/main/home',
      '4': '/main/home-s',
      '5': '/main/home-a',
      '7': '/main/home-specialist',
    };

    const allowedRoute = roleRoutes[userRole];

    // Si la ruta solicitada ya es la correcta, permitir acceso
    if (route.routeConfig?.path && `/main/${route.routeConfig.path}` === allowedRoute) {
      return true;
    }

    // Redirigir solo si intenta acceder a una ruta diferente
    if (allowedRoute) {
      this.router.navigate([allowedRoute]);
    } else {
      this.router.navigate(['/auth/login']); // Si el rol no es válido
    }

    return false;
  }
}
