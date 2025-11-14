export interface EditarUsuarioDTO {
  nombre: string;
  email: string; // se envía pero está bloqueado en el front
  telefono: string;
  contrasenia: string;
  foto_perfil: string;
  fechaNacimiento: string; // ISO string
  rol: string;
}
