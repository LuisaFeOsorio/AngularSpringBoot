import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';


interface AlojamientoDTO {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  ciudad: string;
  pais: string;
  direccion: string;
  precioPorNoche: number;
  capacidadMaxima: number;
  numeroHabitaciones: number;
  numeroBanos: number;
  servicios: string[];
  imagenes: string[];
  imagenPrincipal?: string;
  calificacionPromedio?: number;
  anfitrionId?: number;
  fechaCreacion?: string;
  totalCalificaciones?: number;
  activo?: boolean;
}

@Component({
  selector: 'app-detalle-alojamiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-alojamiento.component.html'
})
export class DetalleAlojamientoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  alojamiento: AlojamientoDTO | null = null;
  cargando = true;
  error = '';
  imagenActualIndex = 0;

  ngOnInit() {
    this.cargarAlojamiento();
  }

  cargarAlojamiento(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('🔵 ID obtenido de la ruta:', id, 'Tipo:', typeof id);

    if (!id) {
      this.error = 'ID de alojamiento no válido';
      this.cargando = false;
      return;
    }

    const url = `/api/alojamientos/${id}`;
    console.log('🔗 URL completa:', url);

    this.http.get<AlojamientoDTO>(url)
      .subscribe({
        next: (alojamiento) => {
          console.log('✅ ALOJAMIENTO CARGADO EXITOSAMENTE:', alojamiento);
          this.alojamiento = alojamiento;
          this.cargando = false;
        },
        error: (err) => {
          console.error('❌ ERROR DETALLADO:', err);
          console.log('📊 Status:', err.status);
          console.log('📊 Message:', err.message);
          console.log('📊 Error body:', err.error);

          this.error = `Error ${err.status}: ${err.message}`;
          this.cargando = false;
        }
      });
  }

  getImagenPrincipal(): string {
    if (!this.alojamiento) return 'assets/images/placeholder-alojamiento.jpg';

    return this.alojamiento.imagenPrincipal ||
      (this.alojamiento.imagenes && this.alojamiento.imagenes.length > 0 ?
        this.alojamiento.imagenes[0] : 'assets/images/placeholder-alojamiento.jpg');
  }

  getImagenes(): string[] {
    if (!this.alojamiento || !this.alojamiento.imagenes) return [];
    return this.alojamiento.imagenes;
  }

  cambiarImagen(direccion: 'anterior' | 'siguiente'): void {
    const imagenes = this.getImagenes();
    if (imagenes.length <= 1) return;

    if (direccion === 'siguiente') {
      this.imagenActualIndex = (this.imagenActualIndex + 1) % imagenes.length;
    } else {
      this.imagenActualIndex = this.imagenActualIndex === 0 ?
        imagenes.length - 1 : this.imagenActualIndex - 1;
    }
  }

  seleccionarImagen(index: number): void {
    this.imagenActualIndex = index;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  getTipoDisplayName(tipo: string): string {
    const nombres: { [key: string]: string } = {
      'CASA': 'Casa',
      'DEPARTAMENTO': 'Departamento',
      'LOFT': 'Loft',
      'CABAÑA': 'Cabaña',
      'HOTEL': 'Hotel',
      'HOSTAL': 'Hostal',
      'VILLA': 'Villa',
      'ESTANCIA': 'Estancia',
      'OTRO': 'Otro',
      'APARTAMENTO': 'Apartamento'
    };
    return nombres[tipo] || tipo;
  }

  reservarAlojamiento(): void {
    if (!this.alojamiento) return;

    this.router.navigate(['/crear-reserva', this.alojamiento.id]);
  }

  volverAlListado(): void {
    this.router.navigate(['/home-usuario']);
  }
}
