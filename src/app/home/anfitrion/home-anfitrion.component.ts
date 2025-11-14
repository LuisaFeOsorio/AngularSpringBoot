import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';

interface AlojamientoDTO {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  ciudad: string;
  pais: string;
  direccion?: string;
  precioPorNoche: number;
  capacidadMaxima: number;
  numeroHabitaciones?: number;
  numeroBanos?: number;
  servicios?: string[];
  imagenes?: string[];
  imagenPrincipal?: string;
  calificacionPromedio?: number;
  activo?: boolean;
  anfitrionId?: number;
  fechaCreacion?: string;
  totalCalificaciones?: number;
}

@Component({
  selector: 'app-dashboard-anfitrion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'home-anfitrion.component.html'
})
export class DashboardAnfitrionComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);

  alojamientos: AlojamientoDTO[] = [];
  cargando = false;
  error = '';
  buscando = false;

  ngOnInit() {
    console.log('🔵 Dashboard anfitrión init');
    this.cargarMisAlojamientos();
  }

  private getAuthHeaders(): HttpHeaders {
    const headersObj = this.auth.getAuthHeaders();
    return new HttpHeaders(headersObj);
  }
  verReservasPendientes(): void {
    const userId = this.auth.getCurrentUserId();
    console.log("📬 Navegando a reservas pendientes del anfitrión ID:", userId);
    this.router.navigate(['/reservas-pendientes', userId]);
  }


  cargarMisAlojamientos(): void {
    this.cargando = true;
    this.error = '';

    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      console.error('❌ No se pudo obtener el ID del usuario autenticado.');
      this.error = 'Error: No se encontró el ID del anfitrión autenticado.';
      this.cargando = false;
      return;
    }

    console.log('📡 Solicitando alojamientos del anfitrión con ID:', userId);

    const headers = this.getAuthHeaders();
    const url = `http://localhost:8080/api/alojamientos/mis-alojamientos/${userId}`;
    console.log('🔗 URL de la solicitud:', url);

    this.http.get<{ error: boolean; message: string; data: AlojamientoDTO[] }>(url, { headers }).subscribe({
      next: (response) => {
        console.log('📥 Respuesta completa del backend:', response);

        if (!response) {
          console.warn('⚠️ La respuesta del backend está vacía o es indefinida.');
          this.error = 'Respuesta vacía del servidor.';
          this.alojamientos = [];
          this.cargando = false;
          return;
        }

        if (response.error) {
          console.warn('⚠️ El backend indicó un error:', response.message);
          this.error = response.message || 'Error al obtener los alojamientos.';
          this.alojamientos = [];
          this.cargando = false;
          return;
        }

        if (Array.isArray(response.data)) {
          this.alojamientos = response.data;
          console.log(`🏠 Alojamientos cargados: ${this.alojamientos.length}`);
          this.alojamientos.forEach(a =>
            console.log(`   ➤ ${a.nombre} (${a.ciudad})`)
          );
        } else {
          console.warn('⚠️ La propiedad "data" no es un arreglo:', response.data);
          this.alojamientos = [];
        }

        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Error HTTP al cargar alojamientos:', err);
        this.error = err.error?.message || `Error ${err.status}: ${err.statusText}`;
        this.alojamientos = [];
        this.cargando = false;
      }
    });
  }

  crearAlojamiento(): void {
    console.log('➡️ Navegar a crear alojamiento');
    this.router.navigate(['/crear-alojamiento']);
  }

  editarAlojamiento(alojamientoId: number): void {
    console.log('✏️ Editar alojamiento id=', alojamientoId);
    this.router.navigate(['/editar-alojamiento', alojamientoId]);
  }

  verComentarios(alojamientoId: number): void {
    console.log('💬 Ver/Responder comentarios alojamiento id=', alojamientoId);
    this.router.navigate(['/alojamientos', alojamientoId, 'comentarios']);
  }

  editarPerfil(): void {
    console.log('👤 Ir a editar perfil');
    const userId = this.auth.getCurrentUserId();
    if (userId) {
      this.router.navigate(['/editar-usuario', userId]);
    }
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  getImagenPrincipal(alojamiento: AlojamientoDTO): string {
    if (alojamiento.imagenPrincipal && alojamiento.imagenPrincipal.trim() !== '') {
      return alojamiento.imagenPrincipal;
    }

    if (alojamiento.imagenes && alojamiento.imagenes.length > 0) {
      return alojamiento.imagenes[0]; // ✅ usa la primera imagen como principal
    }
    return '';
  }

  toggleActivo(alojamiento: AlojamientoDTO): void {
    alojamiento.activo = !alojamiento.activo;
    console.log('🔁 Toggle activo local para alojamiento', alojamiento.id, 'nuevo estado=', alojamiento.activo);
  }

  eliminarAlojamiento(alojamientoId: number): void {
    console.log('🗑️ Intentando eliminar alojamiento id=', alojamientoId);
    this.router.navigate(['/eliminar-alojamiento', alojamientoId]);
  }

}
