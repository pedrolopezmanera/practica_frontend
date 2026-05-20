import {Usuario} from "./user.model";

export interface Direccion {
    id: number|null;

    nombreCalle: string;

    numeroCalle: number;

    usuario?: any;

    direccionPrincipal: boolean;
}