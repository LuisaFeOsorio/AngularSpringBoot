// crear-reserva.component.ts - TOTALMENTE CORREGIDO
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

interface ResponseDTO<T> {
  error: boolean;
  message: string;
  data: T;
}

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
    console.log("🟦 Iniciando CrearReserva...");
    this.verificarAutenticacion();
    this.cargarAlojamiento();
  }

  verificarAutenticacion() {
    console.log("🟨 Verificando autenticación...");

    if (!this.authService.isLoggedIn()) {
      this.error = 'Debes iniciar sesión para realizar una reserva';
      console.log("❌ Usuario no autenticado");
      return;
    }

    const usuarioId = this.authService.getCurrentUserId();

    if (!usuarioId) {
      this.error = 'No se pudo identificar al usuario';
      console.log("❌ No hay usuarioId en token");
      return;
    }

    this.reserva.usuarioId = usuarioId;
    console.log("✔ Usuario autenticado ID:", usuarioId);
  }

  cargarAlojamiento() {
    if (this.error) return;

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'ID de alojamiento no válido';
      console.log("❌ ID no encontrado en URL");
      return;
    }

    this.reserva.alojamientoId = Number(id);
    console.log("🔍 Cargando alojamiento ID:", id);

    this.http.get<ResponseDTO<Alojamiento>>(`/api/alojamientos/${id}`).subscribe({
      next: (response) => {
        console.log("📥 Respuesta cruda del backend:", response);

        if (!response || !response.data) {
          this.error = "No se recibió información válida del servidor.";
          console.log("❌ La respuesta no contiene 'data'");
          return;
        }

        this.alojamiento = response.data;

        // Ajuste inicial de huéspedes
        this.reserva.numeroHuespedes = 1;

        console.log("🏠 Alojamiento cargado:", this.alojamiento);
      },

      error: (err: HttpErrorResponse) => {
        console.error("❌ Error cargando alojamiento:", err);
        this.error = 'No se pudo cargar la información del alojamiento.';
      }
    });
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getMinCheckoutDate(): string {
    if (!this.reserva.checkIn) return this.getTodayDate();

    const date = new Date(this.reserva.checkIn);
    date.setDate(date.getDate() + 1);

    return date.toISOString().split('T')[0];
  }

  calcularNoches(): number {
    if (!this.reserva.checkIn || !this.reserva.checkOut) return 0;

    const checkIn = new Date(this.reserva.checkIn);
    const checkOut = new Date(this.reserva.checkOut);

    const diff = checkOut.getTime() - checkIn.getTime();
    if (diff <= 0) return 0;

    return diff / (1000 * 60 * 60 * 24);
  }


  crearReserva() {
    console.log("🟦 Enviando reserva...", this.reserva);

    if (!this.authService.isLoggedIn()) {
      this.mensaje = 'Debes iniciar sesión para crear una reserva';
      this.exito = false;
      return;
    }

    if (!this.alojamiento) {
      this.mensaje = 'No hay información del alojamiento disponible.';
      this.exito = false;
      return;
    }

    const headers = new HttpHeaders(this.authService.getAuthHeaders());

    this.cargando = true;

    this.http.post("http://localhost:8080/api/reservas/crear", this.reserva, { headers })
      .subscribe({
        next: (res: any) => {
          console.log("✔ Reserva creada:", res);
          this.cargando = false;
          this.mensaje = '¡Reserva creada con éxito!';
          this.exito = true;

          setTimeout(() => {
            this.router.navigate(['/mis-reservas']);
          }, 2000);
        },

        error: (err) => {
          this.cargando = false;
          console.error("❌ Error creando reserva:", err);

          this.mensaje = err.error?.message || 'Error al crear la reserva';
          this.exito = false;
        }
      });
  }

  toggleServicio(servicio: string, event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) this.reserva.serviciosExtras.push(servicio);
    else this.reserva.serviciosExtras = this.reserva.serviciosExtras.filter(s => s !== servicio);
  }

  calcularTotal(): number {
    if (!this.alojamiento) return 0;

    const checkIn = new Date(this.reserva.checkIn);
    const checkOut = new Date(this.reserva.checkOut);

    const diff = checkOut.getTime() - checkIn.getTime();
    if (diff <= 0) return 0;

    const noches = diff / (1000 * 60 * 60 * 24);
    return noches * this.alojamiento.precioPorNoche;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(precio);
  }

  volverAlDetalle() {
    this.router.navigate(['/detalle-alojamiento', this.reserva.alojamientoId]);
  }
}
