import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eliminar-alojamiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'eliminar-alojamiento.component.html'
})
export class EliminarAlojamientoComponent implements OnInit {

  alojamiento: any = null;
  puedeEliminarse: boolean | null = null;
  mensaje: string = '';
  error: string = '';
  cargando: boolean = false;

  private apiUrl = 'http://localhost:8080/api/alojamientos';

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const alojamientoId = this.route.snapshot.paramMap.get('id');
    if (alojamientoId) {
      this.cargarAlojamiento(Number(alojamientoId));
      this.verificarPuedeEliminarse(alojamientoId);
    }
  }

  cargarAlojamiento(id: number): void {
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe({
      next: (response) => {
        if (response && !response.error) {
          this.alojamiento = response.data;
          console.log('🏠 Alojamiento cargado:', this.alojamiento);
        } else {
          this.error = response?.mensaje || 'Error al cargar alojamiento';
        }
      },
      error: (err) => {
        console.error('❌ Error al obtener el alojamiento:', err);
        this.error = 'No se pudo cargar el alojamiento';
      }
    });
  }

  verificarPuedeEliminarse(id: string): void {
    this.http.get<any>(`${this.apiUrl}/${id}/puede-eliminarse`).subscribe({
      next: (response) => {
        if (response && !response.error) {
          this.puedeEliminarse = response.data;
          this.mensaje = response.mensaje;
          console.log('🔎 Verificación:', this.mensaje);
        } else {
          this.error = response?.mensaje || 'Error al verificar eliminación';
        }
      },
      error: (err) => {
        console.error('💥 Error al verificar si puede eliminarse:', err);
        this.error = 'No se pudo verificar si el alojamiento puede eliminarse';
      }
    });
  }

  eliminarAlojamiento(): void {
    if (!this.alojamiento || !this.puedeEliminarse) return;

    this.cargando = true;
    this.mensaje = '';
    this.error = '';

    this.http.put<any>(`${this.apiUrl}/${this.alojamiento.id}/eliminar`, {}).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response && !response.error) {
          this.mensaje = '✅ Alojamiento marcado como inactivo correctamente';
          console.log(this.mensaje);
          setTimeout(() => this.router.navigate(['/alojamientos']), 2000);
        } else {
          this.error = response?.mensaje || 'Error al eliminar alojamiento';
        }
      },
      error: (err) => {
        this.cargando = false;
        console.error('💥 Error al eliminar alojamiento:', err);
        this.error = 'No se pudo eliminar el alojamiento';
      }
    });
  }
}
