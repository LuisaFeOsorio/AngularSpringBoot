import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AlojamientoService {
  private apiUrl = '/api/alojamientos';

  constructor(private http: HttpClient) {}

  crearAlojamiento(Id: number, alojamiento: any) {
    console.log('🟦 Enviando solicitud POST ->', `${this.apiUrl}/crear/${Id}`);
    console.log('📤 Datos enviados al backend:', alojamiento);
    return this.http.post(`http://localhost:8080/api/alojamientos/crear/${Id}`, alojamiento);
  }
}
