import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../../usuarios/services/users.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export default class LoginComponent {
  public email: string = '';
  public pass: string = '';
  public loading: boolean = false;
  public showpass: boolean = false;
  public typei: string = 'password';

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService
  ) { }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  showpasschange() {
    this.showpass = !this.showpass;
    if (this.showpass == true) {
      this.typei = 'text';
      this.cdr.detectChanges();
    } else {
      this.typei = 'password';
      this.cdr.detectChanges();
    }
  }

  async onLogin() {
    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...',
      didOpen: () => Swal.showLoading(),
      customClass: {
        container: 'swal-topmost'
      }
    });

    try {
      const user = await this.authService.login(this.email, this.pass);

      if (user?.user?.uid) {
        const userd = this.usersService.getByUId(user.user.uid);

        if (!userd) {
          this.showMessage('error', 'Error', 'Usuario no encontrado');
          return;
        }

         localStorage.setItem('rwuserdatatk', JSON.stringify(userd));

        if (userd.idRol === '6') {
          this.router.navigate(['/cedis/recoleccion']);
          return;
        }



        this.router.navigate(['/tareas/selecciona-responsable']);
        // if (userd.idRol === '1' || userd.idRol === '5') {
        //   this.router.navigate(['/main/home-a']);
        // } else if (userd.idRol === '2' || userd.idRol === '3') {
        //   this.router.navigate(['/main/home']);
        // } else if (userd.idRol === '4') {
        //   this.router.navigate(['/main/home-s']);
        // } else if (userd.idRol === '6') {
        //   this.router.navigate(['/cedis/recoleccion']);
        // } else if (userd.idRol === '7') {
        //   this.router.navigate(['/main/home-specialist']);
        // } else if (userd.idRol === '8') {
        //   this.router.navigate(['/nomina/control-de-personal']);
        // }
      }
      Swal.close();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.showMessage('error', 'Error', 'Error al autenticar');
      Swal.close();
    }
  }
}
