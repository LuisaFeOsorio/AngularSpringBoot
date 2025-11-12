// src/app/reservas/mis-reservas.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservaService, ReservaDTO } from './reserva.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'mis-reservas.component.html'
})
export class MisReservasComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  reservas: ReservaDTO[] = [];
  cargando = false;
  error = '';

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Debes iniciar sesión para ver tus reservas';
      return;
    }

    this.cargando = true;
    this.reservaService.getMisReservas().subscribe({
      next: (data) => {
        this.cargando = false;
        this.reservas = data;
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401) {
          this.error = 'Sesión expirada. Inicia sesión nuevamente.';
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.error = 'No se pudieron cargar tus reservas.';
          console.error(err);
        }
      }
    });
  }

  verDetalleAlojamiento(nombre: string) {
    this.router.navigate(['/detalle-alojamiento', nombre]);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
