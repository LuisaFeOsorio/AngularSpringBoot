import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface ReservaDTO {
  id: number;
  checkIn: string;
  checkOut: string;
  numeroHuespedes: number;
  precioTotal: number;
  precioPorNoche: number;
  estado: string;
  fechaCreacion: string;

  // Información del usuario
  usuarioId: number;
  usuarioNombre: string;
  usuarioEmail: string;

  // Información del alojamiento
  alojamientoId: number;
  alojamientoNombre: string;
  alojamientoDireccion?: string;
  alojamientoCiudad?: string;
  alojamientoPais?: string;

  // Información del anfitrión
  anfitrionId: number;
  anfitrionNombre: string;

  // Servicios
  serviciosExtras: string[];

  // Comentarios
  tieneComentario: boolean;
  calificacion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'http://localhost:8080/api/reservas';

  getMisReservas(): Observable<ReservaDTO[]> {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());
    return this.http.get<ReservaDTO[]>(`${this.baseUrl}/mis-reservas`, { headers });
  }

}
