import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ]
})
export class LoginComponent {

  nickUsuario: string = '';
  contrasena: string = '';
  mensajeError: string = '';

  constructor(private router: Router, private loginService: LoginService) {
  }

  public async iniciarSesion() {
    this.mensajeError = '';

    const result = await this.loginService.iniciarSesion(this.nickUsuario, this.contrasena);

    if (result.data === true && !result.error) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('nickUsuario', this.nickUsuario);
      this.router.navigate(['/usuarios']);
    } else {
      this.mensajeError = 'Usuario o contraseña incorrectos.';
    }
  }
}
