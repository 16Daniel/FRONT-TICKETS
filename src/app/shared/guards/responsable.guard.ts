import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Usuario } from '../../usuarios/interfaces/usuario.model';

@Injectable({ providedIn: 'root' })
export class ResponsableGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
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
