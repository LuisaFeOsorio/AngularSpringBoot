import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { AlojamientoService } from '../../service/alojamiento.service';

@Component({
  selector: 'app-crear-alojamiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'crear-alojamiento.component.html',
})
export class CrearAlojamientoComponent implements OnInit {
  private http = inject(HttpClient);
  protected router = inject(Router);
  private auth = inject(AuthService);
  private alojamientoService = inject(AlojamientoService);

  tiposAlojamiento = ['CASA', 'APARTAMENTO', 'HABITACION', 'CABANIA', 'HOTEL'];
  serviciosDisponibles = ['WIFI', 'TV', 'COCINA', 'PISCINA', 'PARQUEADERO', 'GIMNASIO', 'DESAYUNO'];

  alojamiento = {
    nombre: '',
    descripcion: '',
    tipo: '',
    ciudad: '',
    pais: '',
    direccion: '',
    precioPorNoche: null as number | null,
    capacidadMaxima: null as number | null,
    numeroHabitaciones: null as number | null,
    numeroBanos: null as number | null,
    servicios: [] as string[],
    imagenes: [] as string[],
    anfitrionId: null as number | null
  };

  cargando = false;
  mensaje = '';
  error = '';
  selectedFile: File | null = null;
  imagenUrlSubida: string = '';

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log("📁 Imagen seleccionada", file);
    }
  }

  async subirImagenYObtenerURL(): Promise<string> {
    if (!this.selectedFile) return '';

    const formData = new FormData();
    formData.append("file", this.selectedFile);

    return new Promise((resolve, reject) => {
      this.http.post<any>("http://localhost:8080/api/imagenes", formData)
        .subscribe({
          next: (res) => {
            const url = res.data.url;
            console.log("🌐 URL recibida desde el backend:", url);
            resolve(url);
          },
          error: (err) => {
            console.error("❌ Error al subir imagen:", err);
            reject(err);
          }
        });
    });
  }


  ngOnInit() {
    console.log('🏡 Iniciando CrearAlojamientoComponent');
    const userId = this.auth.getCurrentUserId();

    if (userId) {
      this.alojamiento.anfitrionId = userId;
      console.log('✅ ID del anfitrión asignado:', userId);
    } else {
      console.error('❌ No se encontró ID del usuario autenticado');
      this.router.navigate(['/login']);
    }
  }

  getAuthHeaders(): HttpHeaders {
    const headersObj = this.auth.getAuthHeaders();
    return new HttpHeaders(headersObj);
  }

  agregarServicio(servicio: string) {
    if (servicio && !this.alojamiento.servicios.includes(servicio)) {
      this.alojamiento.servicios.push(servicio);
      console.log('➕ Servicio añadido:', servicio);
    }
  }

  eliminarServicio(servicio: string) {
    this.alojamiento.servicios = this.alojamiento.servicios.filter(s => s !== servicio);
    console.log('❌ Servicio eliminado:', servicio);
  }

  agregarImagen(url: string) {
    if (url && !this.alojamiento.imagenes.includes(url)) {
      this.alojamiento.imagenes.push(url);
      console.log('🖼️ Imagen añadida:', url);
    }
  }

  eliminarImagen(url: string) {
    this.alojamiento.imagenes = this.alojamiento.imagenes.filter(img => img !== url);
    console.log('🗑️ Imagen eliminada:', url);
  }

  async crearAlojamiento() {
    try {
      let urlImagen = '';

      if (this.selectedFile) {
        urlImagen = await this.subirImagenYObtenerURL();
      }

      const body = {
        ...this.alojamiento,
        imagenes: urlImagen ? [urlImagen] : []
      };

      console.log("📤 Enviando alojamiento:", body);

      this.http.post(`http://localhost:8080/api/alojamientos/crear/${this.alojamiento.anfitrionId}`, body)
        .subscribe({
          next: res => {
            alert("Alojamiento creado!");
          },
          error: err => {
            console.error(err);
          }
        });

    } catch (error) {
      console.error("Error en creación:", error);
    }
  }

}
