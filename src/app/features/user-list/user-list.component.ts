import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/core/models/user.model';
import { PuestoDeTrabajo } from 'src/app/core/models/puestodetrabajo.model';
import { UserService } from 'src/app/core/services/user.service';
import { UserPopupComponent } from '../user-popup/user-popup.component';

type UsuarioView = Usuario & {
  generoId: number | null;
  puestoDeTrabajoId: number | null;
  puestoDeTrabajoNombre: string | null;
};

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, UserPopupComponent]
})
export class UserListComponent implements OnInit {
  @Output() cerrarPopUpOk = new EventEmitter<void>();
  @Output() cerrarPopUpCancel = new EventEmitter<void>();

  modoPopup: string = 'CLOSED';
  estadoPopup: string = 'CREAR';
  usuarios: UsuarioView[] = [];
  puestosDeTrabajo: PuestoDeTrabajo[] = [];
  selectedUserId: number | null = null;
  cargando: boolean = false;
  mensajeError: string = '';
  mensajeInfo: string = '';

  constructor(private router: Router, private userService: UserService) {

  }

  async ngOnInit(): Promise<void> {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn !== 'true') {
      await this.router.navigate(['/login']);
      return;
    }

    await this.cargarPuestosDeTrabajo();
    await this.cargarUsuarios();
  }

  onCerrarPopUpOk() {
    this.modoPopup = 'CLOSED';
    void this.cargarUsuarios();
  }

  onCerrarPopUpCancel() {
    this.modoPopup = 'CLOSED';
  }
  
  launchPopup() {
    this.launchPopupCreate();
  }

  launchPopupCreate() {
    this.mensajeError = '';
    this.mensajeInfo = '';
    this.estadoPopup = 'CREAR';
    this.selectedUserId = null;
    this.modoPopup = 'LAUNCH';
  }

  launchPopupUpdate() {
    if (!this.selectedUserId) {
      return;
    }

    this.mensajeError = '';
    this.mensajeInfo = '';
    this.estadoPopup = 'ACTUALIZAR';
    this.modoPopup = 'LAUNCH';
  }

  async eliminarUsuarioSeleccionado(): Promise<void> {
    if (!this.selectedUserId) {
      return;
    }

    const result = await this.userService.eliminarUsuario(this.selectedUserId);
    if (!result.error) {
      await this.cargarUsuarios();
    }
  }

  lanzarPoupEliminar(): void {
    this.modoPopup = 'DELETE';
  }

  cancelarEliminacion(): void {
    this.modoPopup = 'CLOSED';
  }

  async confirmarEliminacion(): Promise<void> {
    if (!this.selectedUserId) {
      return;
    }

    try {
      this.mensajeError = '';
      this.mensajeInfo = '';
      const response = await this.userService.eliminarUsuario(this.selectedUserId);
      if (response.error) {
        throw response.error;
      }

      this.modoPopup = 'CLOSED';
      await this.cargarUsuarios();
      this.mensajeInfo = 'Usuario eliminado correctamente.';
    } catch (error) {
      this.mensajeError = 'Error al eliminar el usuario.';
      console.error('Error detallado:', error);
    }
  }

  trackByUsuarioId(_: number, usuario: UsuarioView): number {
    return usuario.id;
  }

  nombreCompleto(usuario: UsuarioView): string {
    return [usuario.nombre, usuario.primerApellido, usuario.segundoApellido]
      .filter((value) => !!value)
      .join(' ');
  }

  getDireccionPrincipal(usuario: UsuarioView): string {
    const principal = usuario.direcciones?.find((direccion) => direccion.direccionPrincipal);
    if (!principal) {
      return '-';
    }

    return `${principal.nombreCalle} ${principal.numeroCalle}`;
  }

  getDireccionesExtra(usuario: UsuarioView): string {
    const extras = usuario.direcciones?.filter((direccion) => !direccion.direccionPrincipal) ?? [];
    if (!extras.length) {
      return '-';
    }

    return extras.map((direccion) => `${direccion.nombreCalle} ${direccion.numeroCalle}`).join(' | ');
  }

  private async cargarUsuarios(): Promise<void> {
    this.cargando = true;
    this.mensajeError = '';
    const response = await this.userService.obtenerUsuarios();

    if (!response.error && Array.isArray(response.data)) {
      this.usuarios = this.normalizarUsuarios(response.data);
      this.selectedUserId = this.usuarios[0]?.id ?? null;
      this.cargando = false;
      return;
    }

    this.usuarios = [];
    this.selectedUserId = null;
    if (response.error) {
      this.mensajeError = 'No se pudieron cargar los usuarios.';
    }
    this.cargando = false;
  }

  private async cargarPuestosDeTrabajo(): Promise<void> {
    const response = await this.userService.obtenerPuestosDeTrabajo();

    if (!response.error && Array.isArray(response.data)) {
      this.puestosDeTrabajo = response.data;
      return;
    }

    this.puestosDeTrabajo = [];
  }

  private normalizarUsuarios(usuarios: Usuario[]): UsuarioView[] {
    return usuarios.map((usuario) => ({
      ...usuario,
      generoId: usuario.genero?.id ?? (usuario as any).generoId ?? null,
      puestoDeTrabajoId: usuario.puestoTrabajo?.id ?? (usuario as any).puestoDeTrabajoId ?? null,
      puestoDeTrabajoNombre:
        usuario.puestoTrabajo?.nombre ??
        this.puestosDeTrabajo.find((puesto) => puesto.id === ((usuario as any).puestoDeTrabajoId ?? null))?.nombre ??
        null
    }));
  }

}
