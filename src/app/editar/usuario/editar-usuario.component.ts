import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'editar-usuario.component.html'
})
export class EditarUsuarioComponent implements OnInit {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  protected router = inject(Router);

  usuario = {
    nombreCompleto: '',
    telefono: '',
    contrasenia: '',
    fechaNacimiento: '',
    rol: 'USUARIO'  // valor por defecto
  };

  cargando = false;
  mensaje = '';
  error = '';

  ngOnInit() {
    const userId = this.authService.getCurrentUserId();
    console.log('🟢 ngOnInit: userId=', userId);

    if (!userId) {
      this.error = 'Usuario no autenticado.';
      console.error(this.error);
      return;
    }

    console.log(`📡 Solicitando datos del usuario ${userId}`);
    this.http.get<any>(`http://localhost:8080/api/usuarios/${userId}`).subscribe({
      next: (res) => {
        console.log('📥 Respuesta GET usuario:', res);
        const data = res.data;
        if (data) {
          this.usuario = {
            nombreCompleto: data.nombre ?? '',
            telefono: data.telefono ?? '',
            fechaNacimiento: data.fechaNacimiento ?? '',
            contrasenia: '',
            rol: data.rol ?? 'USUARIO'
          };
          console.log('✅ Usuario cargado localmente:', this.usuario);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'No se pudo cargar la información del usuario.';
        console.error('❌ Error GET usuario:', err);
      }
    });
  }

  actualizarUsuario() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.error = 'Usuario no autenticado.';
      console.error(this.error);
      return;
    }

    console.log('✏️ Preparando actualización para usuario ID=', userId);

    const jsonBody: any = {
      nombre: this.usuario.nombreCompleto, // enviamos todo el nombre completo
      telefono: this.usuario.telefono,
      fechaNacimiento: this.usuario.fechaNacimiento,
      rol: this.usuario.rol
    };

    if (this.usuario.contrasenia?.trim()) {
      jsonBody.contrasenia = this.usuario.contrasenia;
    }

    console.log('📤 JSON a enviar PUT /editar:', jsonBody);

    this.cargando = true;
    this.http.put(`http://localhost:8080/api/usuarios/${userId}/editar`, jsonBody).subscribe({
      next: (res: any) => {
        console.log('✅ Respuesta PUT usuario:', res);
        this.cargando = false;
        this.mensaje = 'Usuario actualizado correctamente.';
        this.error = '';

        // Redirección según rol
        if (this.usuario.rol === 'USUARIO') {
          console.log('➡️ Redirigiendo a home-usuario');
          setTimeout(() => this.router.navigate(['/home-usuario']), 800);
        } else if (this.usuario.rol === 'ANFITRION') {
          console.log('➡️ Redirigiendo a home-anfitrion');
          setTimeout(() => this.router.navigate(['/home-anfitrion']), 800);
        } else {
          console.warn('⚠️ Rol desconocido, se queda en la misma página');
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Error PUT usuario:', err);
        this.cargando = false;
        this.error = err.error?.message || 'Error al actualizar usuario.';
      }
    });
  }
}
