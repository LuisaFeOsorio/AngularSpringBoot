import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-editar-alojamiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'editar-alojamiento.component.html'
})
export class EditarAlojamientoComponent implements OnInit {
  alojamiento: any = null;
  serviciosTexto: string = '';
  mensaje: string = '';
  error: string = '';
  cargando: boolean = false;

  private apiUrl = 'http://localhost:8080/api/alojamientos';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const alojamientoId = this.route.snapshot.paramMap.get('id');
    if (alojamientoId) {
      console.log('📡 Cargando alojamiento con ID:', alojamientoId);
      this.cargarAlojamiento(Number(alojamientoId));
    } else {
      this.error = 'No se encontró el ID del alojamiento.';
    }
  }

  cargarAlojamiento(id: number): void {
    this.cargando = true;
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe({
      next: (response) => {
        this.cargando = false;
        console.log('📥 Respuesta del backend:', response);

        if (response && !response.error && response.data) {
          this.alojamiento = response.data;
          console.log('✅ Alojamiento cargado correctamente:', this.alojamiento);

          this.serviciosTexto = (this.alojamiento.servicios || []).join(', ');
        } else {
          this.error = response?.mensaje || 'Error al cargar alojamiento';
          console.warn('⚠️', this.error);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.error = '❌ No se pudo cargar el alojamiento.';
        console.error('Error al cargar alojamiento:', err);
      }
    });
  }

  actualizarServicios(): void {
    this.alojamiento.servicios = this.serviciosTexto
      .split(',')
      .map((s: string) => s.trim().toUpperCase())
      .filter((s: string) => s !== '');
  }

  actualizarAlojamiento(): void {
    if (!this.alojamiento) return;

    this.cargando = true;
    this.mensaje = '';
    this.error = '';

    console.log('✏️ Enviando datos actualizados:', this.alojamiento);

    this.http.put<any>(`${this.apiUrl}/editar/${this.alojamiento.id}`, this.alojamiento).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response && !response.error) {
          this.mensaje = '✅ Alojamiento actualizado correctamente';
          console.log(this.mensaje);
          setTimeout(() => this.router.navigate(['/home-anfitrion']), 1500);
        } else {
          this.error = response?.mensaje || 'Error al actualizar alojamiento';
          console.error(this.error);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.error = '💥 No se pudo actualizar el alojamiento';
        console.error('Error al actualizar alojamiento:', err);
      }
    });
  }
}
