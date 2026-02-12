import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const userData = localStorage.getItem('rwuserdatatk');

    if (!userData) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}
