import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';
import ConstLocalStorage from 'src/app/shared/contants/const-local-storage';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
     FormsModule
  ]
})
export class LoginComponent {

  LoginService: LoginService;
  nickUsuario: string = '';
  contrasena: string = '';

  constructor(private router: Router, private loginService: LoginService) {
    this.LoginService = loginService;

  }

  public async iniciarSesion() {
    console.log('Pulsado botón Iniciar sesión');
    let result = await this.LoginService.iniciarSesion(this.nickUsuario, this.contrasena);
    if(result === true){
      console.log('Inicio de sesión exitoso');
      localStorage.setItem('nickUsuario', this.nickUsuario);
      localStorage.setItem('contrasena', this.contrasena);
      this.router.navigate(['/usuarios']);
    }
    else{
      alert('Credenciales incorrectas');
    }
  console.log('Resultado del inicio de sesión:', result);
  }
}
