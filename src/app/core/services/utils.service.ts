import {HttpHeaders, HttpParams} from "@angular/common/http";
import ConstUrls from "../../shared/contants/const-urls";
import ConstLocalStorage from "../../shared/contants/const-local-storage";
import {Usuario} from "../models/user.model";

export type ToResult<T> = {
    data: T | null;
    error: unknown | null;
};

type ApiResponse = {
    body?: {
        type?: string;
        data?: unknown;
        exception?: {
            codigoDeError?: string;
            mensajeDeError?: string;
        };
    };
};

export default async function to<T>(promise: Promise<T>): Promise<ToResult<T>> {
    try {
        const data = await promise;
        return { data, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
}

export function isOkResponse(response: ApiResponse | null | undefined): boolean {
    if (response && response.body && response.body.type === "OK") {
        return true
    }
    return false
}

export function loadResponseData(response: ApiResponse): unknown {
    return response.body?.data;
}

export function loadResponseError(response: ApiResponse | null | undefined): string {
    if (!response || !response.body || !response.body.exception) {
        return "Error inesperado de servidor";
    } else {
        return `${response.body.exception.codigoDeError ?? ''} ${response.body.exception.mensajeDeError ?? ''}`.trim();
    }
}

export const headers = new HttpHeaders({
    'Content-Type': 'application/json'
});

export function loadCredentials(): HttpParams {
    const usuario = obtenerUsuarioLogado();
    return new HttpParams()
        .set(ConstUrls.NICK_USUARIO_PARAM, usuario?.nickUsuario ?? '')
        .set(ConstUrls.PASS_USUARIO_PARAM, usuario?.contrasena ?? '');
}

export function guardarUsuarioLogado(usuario: Usuario) {
    localStorage.setItem(ConstLocalStorage.USUARIO_LOGADO_STORAGE, JSON.stringify(usuario));
}

export function obtenerUsuarioLogado(): Usuario | null {
    const usuarioStorage = localStorage.getItem(ConstLocalStorage.USUARIO_LOGADO_STORAGE);
    if (!usuarioStorage) {
        return null;
    }

    return JSON.parse(usuarioStorage) as Usuario;
}
