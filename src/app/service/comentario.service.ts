import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders(this.auth.getAuthHeaders());
  }

  crearComentario(reservaId: number, usuarioId: number | null, body: { calificacion: number; contenido: string }) {
    const url = `http://localhost:8080/api/reservas/${reservaId}/comentario?usuarioId=${usuarioId}`;
    return this.http.post(url, body, { headers: this.getHeaders() });
  }
}
