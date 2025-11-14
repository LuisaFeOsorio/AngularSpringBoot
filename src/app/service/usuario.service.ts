import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EditarUsuarioDTO } from '../editar/usuario/editar-usuario-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  obtenerUsuario(id: number): Observable<any> {
    console.log('📥 GET usuario id:', id);
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  actualizarUsuario(id: number, dto: EditarUsuarioDTO): Observable<any> {
    console.log('📤 Enviando JSON al backend:', dto);
    return this.http.put(`${this.apiUrl}/${id}`, dto);
  }
}
