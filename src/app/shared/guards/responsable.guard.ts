import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ResponsableGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const responsable = localStorage.getItem('responsable-tareas');

    if (responsable) {
      return true;
    }

    this.router.navigate(['/tareas/selecciona-responsable']);
    return false;
  }
}
