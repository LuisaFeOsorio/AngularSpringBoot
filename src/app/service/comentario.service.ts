import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';



@Injectable({ providedIn: 'root' })
export class ComentarioService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = 'http://localhost:8080/api/comentarios';
  private getHeaders(): HttpHeaders {
    return new HttpHeaders(this.auth.getAuthHeaders());
  }
  crearComentario(reservaId: number, usuarioId: number | null, body: { calificacion: number; contenido: string }) {
    const url = `http://localhost:8080/api/comentarios/${reservaId}/crear?usuarioId=${usuarioId}`;
    return this.http.post(url, body, { headers: this.getHeaders() });
  }

  responderComentario(comentarioId: number, usuarioId: number | null, body: any) {
    return this.http.post(
      `${this.baseUrl}/${comentarioId}/respuesta/${usuarioId}`,
      body
    );
  }

  obtenerComentarioPorId(id: number) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

}
