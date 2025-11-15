import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ComentarioService } from '../service/comentario.service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-responder-comentario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'responder-comentario.component.html'
})
export class ResponderComentarioComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comentarioService = inject(ComentarioService);
  private auth = inject(AuthService);

  comentarioId!: number;

  comentarioOriginal: any;
  respuesta: string = '';
  error = '';
  cargando = false;

  ngOnInit() {
    this.comentarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarComentario();
  }

  cargarComentario() {
    this.comentarioService.obtenerComentarioPorId(this.comentarioId).subscribe({
      next: (data) => this.comentarioOriginal = data,
      error: () => this.error = 'No se pudo cargar el comentario'
    });
  }

  enviarRespuesta() {
    if (this.respuesta.trim().length < 5) {
      this.error = 'La respuesta debe tener mínimo 5 caracteres.';
      return;
    }

    this.cargando = true;
    const usuarioId = this.auth.getCurrentUserId();

    this.comentarioService
      .responderComentario(this.comentarioId, usuarioId, {
        contenido: this.respuesta
      })
      .subscribe({
        next: () => {
          alert('Respuesta enviada');
          this.router.navigate(['/comentarios']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al enviar respuesta';
          this.cargando = false;
        }
      });
  }
}
