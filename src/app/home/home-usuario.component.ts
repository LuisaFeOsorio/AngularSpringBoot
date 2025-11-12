import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

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
  selector: 'app-alojamientos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-usuario.component.html'
})
export class DashboardUsuarioComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  alojamientos: AlojamientoDTO[] = [];
  cargando = true;
  error = '';

  ngOnInit() {
    console.log('🔵 ngOnInit - Iniciando componente');
    this.cargarAlojamientos();
  }

  cargarAlojamientos(): void {
    console.log('🟡 cargarAlojamientos - Iniciando carga');
    this.cargando = true;
    this.error = '';

    const url = '/api/alojamientos';
    console.log('🔗 URL de la petición:', url);

    this.http.get<AlojamientoDTO[]>(url)
      .subscribe({
        next: (alojamientos) => {
          console.log('✅ SUCCESS - Alojamientos cargados exitosamente');
          console.log('📦 Datos recibidos:', alojamientos);
          console.log('🔢 Número de alojamientos:', alojamientos.length);

          this.alojamientos = alojamientos;
          this.cargando = false;

          // Log detallado de cada alojamiento
          alojamientos.forEach((aloj, index) => {
            console.log(`🏠 Alojamiento ${index + 1}:`, {
              id: aloj.id,
              nombre: aloj.nombre,
              ciudad: aloj.ciudad,
              precio: aloj.precioPorNoche,
              imagenes: aloj.imagenes?.length || 0
            });
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error('❌ ERROR - Error cargando alojamientos:', err);
          console.log('📊 Detalles del error:', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            ok: err.ok,
            headers: err.headers,
            error: err.error
          });

          this.alojamientos = [];
          this.cargando = false;
          this.error = `Error ${err.status}: ${err.statusText}`;

          // Mostrar el error completo en consola
          console.log('🔄 Error completo:', JSON.stringify(err, null, 2));
        },
        complete: () => {
          console.log('🏁 COMPLETE - Petición finalizada');
        }
      });
  }

  verDetalle(alojamientoId: number): void {
    console.log('🔍 Ver detalle del alojamiento:', alojamientoId);
    this.router.navigate(['/detalle-alojamiento', alojamientoId]);
  }

  getImagenPrincipal(alojamiento: AlojamientoDTO): string {
    const imagen = alojamiento.imagenPrincipal ||
      (alojamiento.imagenes && alojamiento.imagenes.length > 0 ? alojamiento.imagenes[0] : 'assets/images/placeholder-alojamiento.jpg');

    console.log(`🖼️ Imagen para alojamiento ${alojamiento.id}:`, imagen);
    return imagen;
  }

  formatearPrecio(precio: number): string {
    const precioFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(precio);

    console.log(`💰 Precio formateado: ${precio} -> ${precioFormateado}`);
    return precioFormateado;
  }

  // Método para recargar manualmente
  recargar(): void {
    console.log('🔄 Recargando alojamientos...');
    this.cargarAlojamientos();
  }
}
