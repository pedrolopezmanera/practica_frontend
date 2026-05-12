import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import to from "./utils.service";
import ConstUrls from 'src/app/shared/contants/const-urls'; 


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {}

  async iniciarSesion(nickUsuario: string, contrasena: string) {
    let params = new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, nickUsuario)
        .set(ConstUrls.PASS_USUARIO_PARAM, contrasena);
    return await to(
        this.http
            .post<boolean>('http://localhost:8080/usuarios/login',
                null, { params: params })
            .toPromise()
    )
  }



}
