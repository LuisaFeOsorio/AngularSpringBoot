import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { MapService } from '../../service/map.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: 'home-usuario.component.html'
})
export class DashboardUsuarioComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private mapService = inject(MapService);

  alojamientos: AlojamientoDTO[] = [];
  alojamientosOriginal: AlojamientoDTO[] = [];

  busqueda: string = '';

  cargando = true;
  error = '';

  selectedLat: number | null = null;
  selectedLng: number | null = null;

  ngOnInit() {
    console.log('🔵 ngOnInit - Iniciando componente');
    this.cargarAlojamientos();

    setTimeout(() => {
      this.mapService.create("mapaBusqueda");

      this.mapService.onMapClick().subscribe(coords => {
        this.selectedLat = coords.lat;
        this.selectedLng = coords.lng;
        console.log("📍 Coordenadas seleccionadas:", coords);
      });
    }, 300);
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
        this.alojamientosOriginal = [...alojamientos];
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

  filtrarAlojamientos() {
    const texto = this.busqueda.trim().toLowerCase();

    if (texto === '') {
      this.alojamientos = [...this.alojamientosOriginal];
      return;
    }

    this.alojamientos = this.alojamientosOriginal.filter(a =>
      a.nombre.toLowerCase().includes(texto)
    );
  }

  // ⭐ Enviar coordenadas al backend
  buscarPorMapa() {
    if (!this.selectedLat || !this.selectedLng) {
      alert("Selecciona una ubicación en el mapa primero");
      return;
    }

    const body = {
      latitud: this.selectedLat,
      longitud: this.selectedLng
    };

    console.log("📡 Enviando búsqueda por mapa:", body);

    this.http.post<AlojamientoDTO[]>('http://localhost:8080/api/alojamientos/buscar-por-ubicacion', body)
      .subscribe({
        next: (response) => {
          this.alojamientos = response;
          this.alojamientosOriginal = response;
        },
        error: err => {
          console.error("❌ Error en búsqueda por ubicación:", err);
          alert("Error buscando por ubicación");
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
      'src/assets/images/placeholder-alojamiento.jpg'
    );
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(precio);
  }

  recargar(): void {
    this.cargarAlojamientos();
  }

  actualizarUsuario() {
    const userId = this.authService.getCurrentUserId();
    if (userId) this.router.navigate(['/editar-usuario', userId]);
  }

  verHistorialReservas() {
    this.router.navigate(['/mis-reservas']);
  }
}
