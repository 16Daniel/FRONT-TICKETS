import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../Services/api.service';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { UsuarioDB, UsuarioLogin } from '../../Interfaces/Usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
public email:string = '';
public pass:string = '';
public loading:boolean = false; 
public showpass:boolean = false;
public typei:string = 'password'; 

constructor(public apiserv:ApiService, public cdr:ChangeDetectorRef,private messageService: MessageService,private router: Router)
{
  
  
}


showMessage(sev:string,summ:string,det:string) {
  this.messageService.add({ severity: sev, summary: summ, detail: det });
}

showpasschange()
{
   this.showpass = !this.showpass;
    if(this.showpass == true)
      {
        this.typei= 'text';
        this.cdr.detectChanges();
      } else
      {
        this.typei= 'password';
        this.cdr.detectChanges();
      }
}

async onLogin() {
  try {
    const user = await this.apiserv.login(this.email, this.pass);
    if(user.user.uid != null || user.user.uid != null)
      {
       (await this.apiserv.getuserdata(user.user.uid)).subscribe({
        next: data => {

          let userd:any = data[0]; 
           localStorage.setItem("rwuserdatatk",JSON.stringify(data[0]));

           if(userd.idRol == '1')
            {
              this.router.navigate(["/main/home-a"]);
            } else 
            {
              this.router.navigate(["/main/home"]);
            }
          
        },
        error: error => {
           console.log(error);
           this.showMessage('error',"Error","Error al procesar la solicitud");
        }
    }); 
      }
  
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
  }
}


}
