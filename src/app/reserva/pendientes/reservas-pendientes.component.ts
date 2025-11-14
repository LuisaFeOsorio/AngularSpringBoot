import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

interface ResponseDTO<T> {
  error: boolean;
  message: string;
  data: T;
}

interface Reserva {
  id: number;
  checkIn: string;
  checkOut: string;
  estado: string;
  usuarioNombre: string;
  alojamientoNombre: string;
}

@Component({
  selector: 'app-reservas-pendientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'reservas-pendientes.component.html'
})
export class ReservasPendientesComponent implements OnInit {

  private http = inject(HttpClient);
  protected authService = inject(AuthService);

  reservas: Reserva[] = [];
  cargando = true;
  error = '';

  ngOnInit() {
    this.cargarReservasPendientes();
  }

  cargarReservasPendientes() {
    this.cargando = true;

    const headers = new HttpHeaders(this.authService.getAuthHeaders());

    const anfitrionId = this.authService.getCurrentUserId();
    if (!anfitrionId) {
      this.error = 'No se encontró ID del anfitrión.';
      this.cargando = false;
      return;
    }

    this.http.get<ResponseDTO<Reserva[]>>(
      `http://localhost:8080/api/reservas/${anfitrionId}/pendientes`,
      { headers }
    ).subscribe({
      next: (res) => {
        this.reservas = res.data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error cargando reservas pendientes';
        this.cargando = false;
      }
    });
  }

  aceptar(id: number) {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());

    this.http.put<ResponseDTO<any>>(
      `http://localhost:8080/api/reservas/${id}/aceptar`,
      {},
      { headers }
    ).subscribe({
      next: () => this.cargarReservasPendientes(),
      error: () => alert('Error al aceptar la reserva')
    });
  }

  rechazar(id: number) {
    const headers = new HttpHeaders(this.authService.getAuthHeaders());

    this.http.put<ResponseDTO<any>>(
      `http://localhost:8080/api/reservas/${id}/rechazar`,
      {},
      { headers }
    ).subscribe({
      next: () => this.cargarReservasPendientes(),
      error: () => alert('Error al rechazar la reserva')
    });
  }
}
