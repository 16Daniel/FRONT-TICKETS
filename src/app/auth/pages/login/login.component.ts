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
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  public email: string = '';
  public pass: string = '';
  public loading: boolean = false;
  public showpass: boolean = false;
  public typei: string = 'password';

  public logoUrl: string = 'assets/img/RW_LogoWEB.png';

  constructor(
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService
  ) { }

  onLogoError(event: any) {
    if (this.logoUrl !== '/front/tickets/assets/img/RW_LogoWEB.png') {
      this.logoUrl = '/front/tickets/assets/img/RW_LogoWEB.png';
      this.cdr.markForCheck();
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  showpasschange() {
    this.showpass = !this.showpass;
    if (this.showpass) {
      this.typei = 'text';
    } else {
      this.typei = 'password';
    }
    this.cdr.markForCheck();
  }

  async onLogin() {
    if (!this.email || !this.pass) {
      this.showMessage('warn', 'Atención', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

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
          this.loading = false;
          this.cdr.markForCheck();
          Swal.close();
          return;
        }

        localStorage.setItem('rwuserdatatk', JSON.stringify(userd));

        // if (userd.idRol === '6') {
        //   this.router.navigate(['/cedis/recoleccion']);
        //   this.loading = false;
        //   this.cdr.markForCheck();
        //   Swal.close();
        //   return;
        // }

        this.router.navigate(['/usuarios/selecciona-responsable']);
      }
      this.loading = false;
      this.cdr.markForCheck();
      Swal.close();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      this.showMessage('error', 'Error', 'Error al autenticar. Verifica tus credenciales.');
      this.loading = false;
      this.cdr.markForCheck();
      Swal.close();
    }
  }
}
