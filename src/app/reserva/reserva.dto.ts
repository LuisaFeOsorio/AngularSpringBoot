export interface ReservaDTO {
  id: string;
  alojamientoNombre: string;
  alojamientoDireccion: string;
  usuarioNombre: string;
  anfitrionNombre: string;
  checkIn: string;
  checkOut: string;
  numeroHuespedes: number;
  precioTotal: number;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
}
