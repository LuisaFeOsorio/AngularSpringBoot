import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface ResponseDTO<T> {
  error: boolean;
  mensaje: string;
  data: T;
}

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

  cargarAlojamiento() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    const url = `http://localhost:8080/api/alojamientos/${id}`;

    console.log("🔵 Solicitando alojamiento con ID:", id);

    this.http.get<ResponseDTO<AlojamientoDTO>>(url).subscribe({
      next: (res) => {
        console.log("📦 Respuesta backend:", res);

        if (!res || !res.data) {
          this.error = "No se encontró el alojamiento.";
          this.cargando = false;
          return;
        }

        this.alojamiento = res.data;
        this.cargando = false;

        console.log("🏠 Alojamiento cargado:", this.alojamiento);
      },
      error: (err) => {
        console.error("❌ Error cargando alojamiento:", err);
        this.error = "No se pudo cargar el alojamiento.";
        this.cargando = false;
      }
    });
  }


  /** IMÁGENES */
  getImagenes(): string[] {
    if (!this.alojamiento) return [];
    return this.alojamiento.imagenes || [];
  }

  getImagenActual(): string {
    const imgs = this.getImagenes();
    if (imgs.length === 0) return "";
    return imgs[this.imagenActualIndex];
  }

  cambiarImagen(dir: 'anterior' | 'siguiente'): void {
    const imgs = this.getImagenes();
    if (imgs.length <= 1) return;

    if (dir === 'siguiente') {
      this.imagenActualIndex = (this.imagenActualIndex + 1) % imgs.length;
    } else {
      this.imagenActualIndex = this.imagenActualIndex === 0
        ? imgs.length - 1
        : this.imagenActualIndex - 1;
    }
  }

  seleccionarImagen(index: number): void {
    this.imagenActualIndex = index;
  }

  /** FORMATEO */
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

  /** Navegación */
  reservarAlojamiento() {
    if (!this.alojamiento) return;
    this.router.navigate(['/crear-reserva', this.alojamiento.id]);
  }

  volverAlListado(): void {
    this.router.navigate(['/home-usuario']);
  }
}
