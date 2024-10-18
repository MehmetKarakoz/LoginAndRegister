import { Component , inject} from '@angular/core';
import {FormsModule} from '@angular/forms'
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private router: Router) {}
  loginObj:any={
    userName:'',
    password:''

  }

  onLogin(){
    if(this.loginObj.userName=='admin' && this.loginObj.password=='1234'){
        console.log('Giriş Başarılı ')
        this.router.navigateByUrl("dashboard")
    }
    else
    {
      alert('Kullanıcı Adi veya Sifre yanlis Kontrol ediniz ')
    }
  }
}