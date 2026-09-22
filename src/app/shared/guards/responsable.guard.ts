import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Usuario } from '../../usuarios/interfaces/usuario.model';

@Injectable({ providedIn: 'root' })
export class ResponsableGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!state.url.startsWith('/main/tareas') && !state.url.startsWith('/tareas')) {
      return true;
    }

    if (state.url.includes('/selecciona-responsable')) {
      return true;
    }

    // If coming from another module (not selecciona-responsable or tareas), clear the session
    if (!this.router.url.includes('/selecciona-responsable') && !this.router.url.startsWith('/main/tareas')) {
      localStorage.removeItem('responsable-tareas');
    }

    const responsable = localStorage.getItem('responsable-tareas');
    let usuario:Usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!); 
    if (responsable ) {
      return true;
    } 

    if(usuario != undefined && usuario.idRol == '6')
      {
        return true; 
      }

    this.router.navigate(['/tareas/selecciona-responsable']);
    return false;
  }
}
