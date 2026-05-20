import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Usuario, usuarioInicial } from "src/app/core/models/user.model";
import { Genero } from "src/app/core/models/genero.model";
import { PuestoDeTrabajo } from "src/app/core/models/puestodetrabajo.model";
import { UserService } from 'src/app/core/services/user.service';

@Component({
    selector: 'app-user-popup',
    templateUrl: './user-popup.component.html',
    styleUrls: ['./user-popup.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [DatePipe]
})
export class UserPopupComponent implements OnInit {

    @Output() cerrarPopUpOk = new EventEmitter<void>();
    @Output() cerrarPopUpCancel = new EventEmitter<void>();

    @Input() estadoPopup: string = 'CREAR';
    @Input() userId: number = 0;

    usuarioActual: Usuario = JSON.parse(JSON.stringify(usuarioInicial));
    generosDisponibles: Genero[] = [];
    puestosDisponibles: PuestoDeTrabajo[] = [];

    direccionSeleccionadaIndex: number = -1;
    indiceDireccionEditando: number = -1;
    fechaCreacionFormateada: string = '';
    guardando: boolean = false;
    mensajeError: string = '';
    mensajeInfo: string = '';

    constructor(private userService: UserService, private datePipe: DatePipe) {}

    async ngOnInit() {
        await this.cargarCatalogos();
        if (this.estadoPopup === 'CREAR') {
            if (!this.usuarioActual.genero) this.usuarioActual.genero = { id: 0, nombre: '' };
            if (!this.usuarioActual.puestoTrabajo) this.usuarioActual.puestoTrabajo = { id: 0, nombre: '' };
            this.usuarioActual.direcciones = [];

            const hoy = new Date();
            this.fechaCreacionFormateada = this.datePipe.transform(hoy, 'yyyy-MM-dd HH:mm') || '';
        } else if (this.estadoPopup === 'ACTUALIZAR' && this.userId > 0) {
            try {
                const responseUsuario = await this.userService.obtenerUsuarioPorId(this.userId);
                if (responseUsuario.error || !responseUsuario.data) {
                    throw responseUsuario.error;
                }

                const usuarioRecuperado = responseUsuario.data;
                if (usuarioRecuperado) {
                    this.usuarioActual = { ...usuarioRecuperado };

                    if (this.usuarioActual.fechaHoraCreacion) {
                        this.fechaCreacionFormateada = this.datePipe.transform(this.usuarioActual.fechaHoraCreacion, 'yyyy-MM-dd HH:mm') || '';
                    }

                    const generoId = (usuarioRecuperado as any).generoId;
                    const puestoDeTrabajoId = (usuarioRecuperado as any).puestoDeTrabajoId;

                    this.usuarioActual.genero = this.generosDisponibles.find((g) => g.id === generoId) || { id: 0, nombre: '' };
                    this.usuarioActual.puestoTrabajo = this.puestosDisponibles.find((p) => p.id === puestoDeTrabajoId) || { id: 0, nombre: '' };

                    if (!this.usuarioActual.direcciones) {
                        this.usuarioActual.direcciones = [];
                    }
                }
            } catch (error) {
                console.error('Error al obtener el usuario:', error);
            }
        }
    }

    async cargarCatalogos() {
        try {
            const responseGeneros = await this.userService.obtenerGeneros();
            const responsePuestos = await this.userService.obtenerPuestosDeTrabajo();

            this.generosDisponibles = !responseGeneros.error && Array.isArray(responseGeneros.data) ? responseGeneros.data : [];
            this.puestosDisponibles = !responsePuestos.error && Array.isArray(responsePuestos.data) ? responsePuestos.data : [];

            if (responseGeneros.error || responsePuestos.error) {
                this.mensajeError = 'No se pudieron cargar todos los catálogos.';
            }
        } catch (error) {
            this.mensajeError = 'Error al cargar los catálogos. Por favor, inténtelo de nuevo.';
            console.error('Error al cargar catálogos:', error);
        }
    }

    validarUsuario(): boolean {
        this.mensajeError = '';
        if (!this.usuarioActual.nombre || this.usuarioActual.nombre.trim() === '') {
            this.mensajeError = 'El nombre del usuario es obligatorio.';
            return false;
        }
        if (!this.usuarioActual.genero || this.usuarioActual.genero.id === 0) {
            this.mensajeError = 'Debe seleccionar un género.';
            return false;
        }
        if (!this.usuarioActual.puestoTrabajo || this.usuarioActual.puestoTrabajo.id === 0) {
            this.mensajeError = 'Debe seleccionar un puesto de trabajo.';
            return false;
        }
        return true;
    }

    crearDireccionVacia() {
        if (!this.usuarioActual.direcciones) {
            this.usuarioActual.direcciones = [];
        }
        const nuevaDireccion = {
            id: null,
            nombreCalle: '',
            numeroCalle: 0,
            direccionPrincipal: false,
        };
        this.usuarioActual.direcciones.push(nuevaDireccion);
        this.indiceDireccionEditando = this.usuarioActual.direcciones.length - 1;
    }

    actualizarDireccion() {
        if (this.direccionSeleccionadaIndex > -1) {
            this.indiceDireccionEditando = this.direccionSeleccionadaIndex;
        }
    }

    eliminarDireccion() {
        if (this.direccionSeleccionadaIndex > -1) {
            const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta dirección?');
            if (confirmacion) {
                this.usuarioActual.direcciones.splice(this.direccionSeleccionadaIndex, 1);
                this.direccionSeleccionadaIndex = -1;
                this.indiceDireccionEditando = -1;
            }
        }
    }

    marcarComoPrincipal(index: number) {
        this.usuarioActual.direcciones.forEach((d, i) => d.direccionPrincipal = i === index);
    }

    async onSave() {
        if (!this.validarUsuario() || this.guardando) {
            return;
        }

        this.mensajeError = '';
        this.mensajeInfo = '';
        this.guardando = true;
        try {
            const datosParaBackend: any = {
                ...this.usuarioActual,
                id: this.usuarioActual.id ? this.usuarioActual.id : null,
                generoId: this.usuarioActual.genero ? this.usuarioActual.genero.id : null,
                puestoDeTrabajoId: this.usuarioActual.puestoTrabajo ? this.usuarioActual.puestoTrabajo.id : null
            };

            if (this.estadoPopup === 'CREAR') {
                const responseCrear = await this.userService.crearUsuario(datosParaBackend);
                if (responseCrear.error) {
                    const error = responseCrear.error as any;
                    if (error?.status === 400 || error?.status === 409) {
                        this.mensajeError = 'El usuario ya existe, elige otro.';
                    } else {
                        this.mensajeError = 'Error al guardar en la base de datos.';
                        console.error('Error detallado:', error);
                    }
                    return;
                }
                this.mensajeInfo = 'Usuario creado correctamente.';
            } else {
                const responseActualizar = await this.userService.actualizarUsuario(datosParaBackend);
                if (responseActualizar.error) {
                    const error = responseActualizar.error as any;
                    if (error?.status === 400 || error?.status === 409) {
                        this.mensajeError = 'El usuario ya existe, elige otro.';
                    } else {
                        this.mensajeError = 'Error al actualizar.';
                        console.error('Error detallado:', error);
                    }
                    return;
                }
                this.mensajeInfo = 'Usuario actualizado correctamente.';
            }
            setTimeout(() => {
                this.cerrarPopUpOk.emit();
            }, 700);
        } catch (error) {
            this.mensajeError = 'Error al guardar los datos.';
            console.error(error);
        } finally {
            this.guardando = false;
        }
    }

    onCancel() {
        this.mensajeError = '';
        this.mensajeInfo = '';
        this.cerrarPopUpCancel.emit();
    }

    guardarDireccionEditada() {
        if (this.indiceDireccionEditando > -1) {
            // Aquí puedes agregar lógica para guardar los cambios realizados en la dirección editada.
            this.indiceDireccionEditando = -1; // Finaliza la edición.
            this.mensajeInfo = 'Dirección editada correctamente.';
        }
    }
}
