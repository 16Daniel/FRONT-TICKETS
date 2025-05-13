import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminAreaGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userData = localStorage.getItem('rwuserdatatk');
    if (!userData) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const user = JSON.parse(userData);
    const userRole = user.idRol;
    if (userRole === '5') {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
