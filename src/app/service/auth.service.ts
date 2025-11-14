// auth.service.ts - CORREGIDO
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

interface LoginResponse {
  error: boolean;
  message?: string;
  data?: string; // ← El token viene en 'data'
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth/login';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.cargarUsuarioDesdeToken();
  }

  login(email: string, contrasenia: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { email, contrasenia });
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    console.log('👋 Usuario deslogueado');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ✅ CORREGIDO: Mejorar el método para debugging
  cargarUsuarioDesdeToken() {
    const token = this.getToken();
    console.log('🔍 Cargando usuario desde token:', token ? 'Token existe' : 'No hay token');

    if (token) {
      try {
        // Decodificar el token JWT
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📋 Payload del token:', payload);

        const usuario: Usuario = {
          id: Number(payload.id) || 0,
          nombre: payload.nombre || payload.name || 'Usuario',
          email: payload.email || payload.sub || 'usuario@ejemplo.com',
          role: payload.role || payload.rol || 'USUARIO'


        };

        this.currentUserSubject.next(usuario);
        console.log('👤 Usuario cargado desde token:', usuario);
      } catch (error) {
        console.error('❌ Error decodificando token:', error);
        console.error('❌ Token problemático:', token);
        this.logout();
      }
    } else {
      console.log('❌ No hay token en localStorage');
    }
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): number | null {
    const usuario = this.getCurrentUser();
    return usuario ? usuario.id : null;
  }

  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}
