// login.component.ts - CORREGIDO
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../auth/auth.service';

interface LoginDTO {
  email: string;
  contrasenia: string;
}

interface ResponseDTO<T> {
  error: boolean;
  message?: string;
  data?: T;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm: FormGroup;
  loading: boolean = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    console.log('🔑 MÉTODO LOGIN INICIADO');

    if (this.loginForm.invalid) {
      console.log('❌ FORMULARIO INVÁLIDO');
      this.markAllFieldsAsTouched();
      return;
    }

    this.loading = true;

    const loginDTO: LoginDTO = this.loginForm.value;
    console.log('📤 ENVIANDO:', loginDTO);

    this.authService.login(loginDTO.email, loginDTO.contrasenia).subscribe({
      next: (response) => {
        console.log('📥 RESPUESTA LOGIN:', response);

        // ✅ CORREGIDO: Buscar el token en la propiedad 'data' en lugar de 'token'
        const token = response.data; // ← CAMBIO IMPORTANTE aquí

        if (token) {
          localStorage.setItem('token', token);
          console.log('✅ Token guardado, redirigiendo...');

          // El AuthService automáticamente cargará el usuario desde el token
          this.authService.cargarUsuarioDesdeToken(); // ← Asegurar que se cargue el usuario
          this.loading = false;
          this.redirectBasedOnRole();
        } else {
          console.log('❌ No se encontró token en response.data');
          this.handleLoginError('No se recibió token del servidor');
        }
      },
      error: (error) => {
        console.error('⚠️ ERROR DE CONEXIÓN:', error);
        this.handleLoginError('No se pudo conectar con el servidor');
      }
    });
  }

  private handleLoginError(mensaje: string) {
    this.loading = false;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });
  }

  private redirectBasedOnRole() {
    setTimeout(() => {
      const usuario = this.authService.getCurrentUser();
      const role = usuario?.role || 'USUARIO';

      console.log('🎭 Rol detectado para redirección:', role);
      console.log('👤 Usuario actual:', usuario);

      // Redirigir según el rol
      if (role === 'ANFITRION') {
        this.router.navigate(['/home-anfitrion']);
      } else {
        this.router.navigate(['/home-usuario']);
      }
    }, 100);
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}
