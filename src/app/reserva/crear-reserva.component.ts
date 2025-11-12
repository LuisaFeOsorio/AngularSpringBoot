// crear-reserva.component.ts - ACTUALIZADO
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

interface CrearReservaDTO {
  checkIn: string;
  checkOut: string;
  numeroHuespedes: number;
  alojamientoId: number;
  usuarioId: number;
  serviciosExtras: string[];
}

interface Alojamiento {
  id: number;
  nombre: string;
  descripcion: string;
  ciudad: string;
  pais: string;
  precioPorNoche: number;
  capacidadMaxima: number;
  numeroHabitaciones: number;
  numeroBanos: number;
  imagenes: string[];
  servicios: string[];
  tipo: string;
}

@Component({
  selector: 'app-crear-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'crear-reserva.component.html',
})
export class CrearReservaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  protected authService = inject(AuthService);

  reserva: CrearReservaDTO = {
    checkIn: '',
    checkOut: '',
    numeroHuespedes: 1,
    alojamientoId: 0,
    usuarioId: 0,
    serviciosExtras: []
  };

  alojamiento: Alojamiento | null = null;
  cargando = false;
  mensaje = '';
  exito = false;
  error = '';

  ngOnInit() {
    this.verificarAutenticacion();
    this.cargarAlojamiento();
  }

  // NUEVO: Verificar que el usuario esté autenticado
  verificarAutenticacion() {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Debes iniciar sesión para realizar una reserva';
      return;
    }

    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) {
      this.error = 'No se pudo identificar al usuario';
      return;
    }

    this.reserva.usuarioId = usuarioId;
    console.log('👤 Usuario ID para reserva:', usuarioId);
  }

  cargarAlojamiento() {
    if (this.error) return; // No cargar si hay error de autenticación

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de alojamiento no válido';
      return;
    }

    this.reserva.alojamientoId = Number(id);
    console.log('🔄 alojamientoId:', this.reserva.alojamientoId);

    this.http.get<Alojamiento>(`/api/alojamientos/${id}`).subscribe({
      next: (data) => {
        this.alojamiento = data;
        this.reserva.numeroHuespedes = Math.min(1, data.capacidadMaxima);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error cargando alojamiento', err);
        this.error = 'No se pudo cargar la información del alojamiento.';
      }
    });
  }

  crearReserva() {
    // Validar autenticación
    if (!this.authService.isLoggedIn()) {
      this.mensaje = 'Debes iniciar sesión para crear una reserva';
      this.exito = false;
      return;
    }

    if (!this.reserva.usuarioId) {
      this.mensaje = 'Error: No se pudo identificar al usuario';
      this.exito = false;
      return;
    }

    // Resto de validaciones...
    if (!this.alojamiento) {
      this.mensaje = 'No hay información del alojamiento disponible.';
      this.exito = false;
      return;
    }

    if (!this.reserva.checkIn || !this.reserva.checkOut) {
      this.mensaje = 'Por favor selecciona las fechas de check-in y check-out.';
      this.exito = false;
      return;
    }

    const checkIn = new Date(this.reserva.checkIn);
    const checkOut = new Date(this.reserva.checkOut);
    if (checkOut <= checkIn) {
      this.mensaje = 'La fecha de check-out debe ser posterior al check-in.';
      this.exito = false;
      return;
    }

    if (this.reserva.numeroHuespedes > this.alojamiento.capacidadMaxima) {
      this.mensaje = `El número de huéspedes no puede exceder la capacidad máxima (${this.alojamiento.capacidadMaxima}).`;
      this.exito = false;
      return;
    }

    console.log('🔍 Datos a enviar:', JSON.stringify(this.reserva, null, 2));

    this.cargando = true;
    this.mensaje = '';

    // Enviar con headers de autorización
    const headers = new HttpHeaders(this.authService.getAuthHeaders());

    this.http.post("http://localhost:8080/api/reservas/crear", this.reserva, { headers }).subscribe({
      next: (res: any) => {
        this.cargando = false;
        this.mensaje = '¡Reserva creada con éxito!';
        this.exito = true;

        // Limpiar formulario
        this.reserva.checkIn = '';
        this.reserva.checkOut = '';
        this.reserva.numeroHuespedes = 1;
        this.reserva.serviciosExtras = [];

        setTimeout(() => {
          this.router.navigate(['/mis-reservas']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        console.error('❌ ERROR:', err);

        if (err.status === 401) {
          this.mensaje = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          this.authService.logout();
        } else {
          this.mensaje = err.error?.message || 'Error al crear la reserva';
        }
        this.exito = false;
      }
    });
  }

  // Los demás métodos se mantienen igual...
  toggleServicio(servicio: string, event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.reserva.serviciosExtras.push(servicio);
    } else {
      this.reserva.serviciosExtras = this.reserva.serviciosExtras.filter(s => s !== servicio);
    }
  }

  calcularTotal(): number {
    if (!this.alojamiento) return 0;
    const checkIn = new Date(this.reserva.checkIn);
    const checkOut = new Date(this.reserva.checkOut);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * this.alojamiento.precioPorNoche;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  volverAlDetalle(): void {
    this.router.navigate(['/detalle-alojamiento', this.reserva.alojamientoId]);
  }

  getTipoDisplayName(tipo: string): string {
    const nombres: { [key: string]: string } = {
      'CASA': 'Casa', 'DEPARTAMENTO': 'Departamento', 'LOFT': 'Loft',
      'CABAÑA': 'Cabaña', 'HOTEL': 'Hotel', 'HOSTAL': 'Hostal',
      'VILLA': 'Villa', 'ESTANCIA': 'Estancia', 'OTRO': 'Otro',
      'APARTAMENTO': 'Apartamento'
    };
    return nombres[tipo] || tipo;
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getMinCheckoutDate(): string {
    if (!this.reserva.checkIn) return this.getTodayDate();
    const checkInDate = new Date(this.reserva.checkIn);
    checkInDate.setDate(checkInDate.getDate() + 1);
    return checkInDate.toISOString().split('T')[0];
  }

  calcularNoches(): number {
    if (!this.reserva.checkIn || !this.reserva.checkOut) return 0;
    const checkIn = new Date(this.reserva.checkIn);
    const checkOut = new Date(this.reserva.checkOut);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
