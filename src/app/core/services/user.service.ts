import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../models/user.model';
import { Genero } from '../models/genero.model';
import { PuestoDeTrabajo } from '../models/puestodetrabajo.model';
import ConstUrls from 'src/app/shared/contants/const-urls';
import to, { ToResult } from "./utils.service";


@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  async obtenerUsuarioPorId(id: number): Promise<ToResult<Usuario>> {
    return await to(
        firstValueFrom(this.http.get<Usuario>(`${ConstUrls.API_URL}/usuarios/${id}`))
    );
  }

  async obtenerUsuarios(): Promise<ToResult<Usuario[]>> {
    return await to(
        firstValueFrom(this.http.get<Usuario[]>(`${ConstUrls.API_URL}/usuarios`))
    );
  }

  async obtenerGeneros(): Promise<ToResult<Genero[]>> {
    return await to(
        firstValueFrom(this.http.get<Genero[]>(`${ConstUrls.API_URL}/generos`))
    );
  }

  async obtenerPuestosDeTrabajo(): Promise<ToResult<PuestoDeTrabajo[]>> {
    return await to(
        firstValueFrom(this.http.get<PuestoDeTrabajo[]>(`${ConstUrls.API_URL}/puestos-de-trabajo`))
    );
  }

  async crearUsuario(usuario: Usuario): Promise<ToResult<Usuario>> {
    return await to(
        firstValueFrom(this.http.post<Usuario>(`${ConstUrls.API_URL}/usuarios`, usuario))
    );
  }

  async actualizarUsuario(usuario: Usuario): Promise<ToResult<Usuario>> {
    return await to(
        firstValueFrom(this.http.put<Usuario>(`${ConstUrls.API_URL}/usuarios/${usuario.id}`, usuario))
    );
  }

  async eliminarUsuario(id: number): Promise<ToResult<boolean>> {
    return await to(
        firstValueFrom(this.http.delete<boolean>(`${ConstUrls.API_URL}/usuarios/${id}`))
    );
  }

}
