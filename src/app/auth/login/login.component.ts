import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

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
  ) {}

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
    try {
      const user = await this.authService.login(this.email, this.pass);
      if (user.user.uid != null || user.user.uid != null) {
        (await this.usersService.getByUId(user.user.uid)).subscribe({
          next: (data) => {
            let userd: any = data[0];
            localStorage.setItem('rwuserdatatk', JSON.stringify(data[0]));

            if (userd.idRol == '1') {
              this.router.navigate(['/main/home-a']);
            } else if (userd.idRol == '2') {
              this.router.navigate(['/main/home']);
            } else if (userd.idRol == '4') {
              this.router.navigate(['/main/home-s']);
            }
          },
          error: (error) => {
            console.log(error);
            this.showMessage(
              'error',
              'Error',
              'Error al procesar la solicitud'
            );
          },
        });
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }
}
