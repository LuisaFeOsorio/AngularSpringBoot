import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // ✅ Asegúrate de tener este servicio

interface AlojamientoDTO {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  ciudad: string;
  pais: string;
  precioPorNoche: number;
  capacidadMaxima: number;
  numeroHabitaciones: number;
  numeroBanos: number;
  servicios: string[];
  imagenes: string[];
  imagenPrincipal?: string;
  calificacionPromedio?: number;
}

@Component({
  selector: 'app-dashboard-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'home-usuario.component.html'
})
export class DashboardUsuarioComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService); // ✅ Inyectamos el AuthService

  alojamientos: AlojamientoDTO[] = [];
  cargando = true;
  error = '';

  ngOnInit() {
    console.log('🔵 ngOnInit - Iniciando componente');
    this.cargarAlojamientos();
  }

  cargarAlojamientos(): void {
    this.cargando = true;
    this.error = '';

    const url = 'http://localhost:8080/api/alojamientos';
    console.log('🔗 Cargando alojamientos desde', url);

    this.http.get<AlojamientoDTO[]>(url).subscribe({
      next: (alojamientos) => {
        console.log('✅ Alojamientos cargados', alojamientos);
        this.alojamientos = alojamientos;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Error cargando alojamientos:', err);
        this.alojamientos = [];
        this.cargando = false;
        this.error = `Error ${err.status}: ${err.statusText}`;
      }
    });
  }

  verDetalle(alojamientoId: number): void {
    this.router.navigate(['/detalle-alojamiento', alojamientoId]);
  }

  getImagenPrincipal(alojamiento: AlojamientoDTO): string {
    return (
      alojamiento.imagenPrincipal ||
      alojamiento.imagenes?.[0] ||
      'assets/images/placeholder-alojamiento.jpg'
    );
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(precio);
  }

  recargar(): void {
    this.cargarAlojamientos();
  }

  // 🔵 Botón para editar usuario
  actualizarUsuario() {
    const userId = this.authService.getCurrentUserId(); // ✅ obtenemos el ID del usuario autenticado
    if (userId) {
      console.log('🧑‍💼 Redirigiendo a actualizar usuario con ID:', userId);
      this.router.navigate(['/editar-usuario', userId]); // ✅ enviamos el ID como parámetro en la ruta
    } else {
      console.error('❌ No se encontró el ID del usuario autenticado.');
    }
  }

  verHistorialReservas() {
    console.log('📜 Redirigiendo al historial de reservas');
    this.router.navigate(['/mis-reservas']);
  }
}
