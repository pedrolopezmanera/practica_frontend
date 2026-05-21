import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from 'rxjs/operators';

@Component({
  selector: "app-root",
  styleUrls: ['./app.component.css'],
  templateUrl: "./app.component.html",
  imports: [
    CommonModule,
    RouterOutlet,
  ],
  standalone: true,

})
export class AppComponent {
  mostrarSalir: boolean = false;

  constructor(private router: Router) {
    this.actualizarEstadoBoton(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEndEvent = event as NavigationEnd;
        this.actualizarEstadoBoton(navigationEndEvent.urlAfterRedirects);
      });
  }

  cerrarSesion(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('nickUsuario');
    this.mostrarSalir = false;
    void this.router.navigate(['/login']);
  }

  private actualizarEstadoBoton(url: string): void {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isLoginRoute = url.startsWith('/login');
    this.mostrarSalir = isLoggedIn && !isLoginRoute;
  }

}
