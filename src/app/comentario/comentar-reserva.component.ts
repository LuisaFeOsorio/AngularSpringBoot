import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ComentarioService } from '../service/comentario.service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-comentar-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'comentar-reserva.component.html'
})
export class ComentarReservaComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comentarioService = inject(ComentarioService);
  private auth = inject(AuthService);

  reservaId!: number;

  calificacion: number = 0;
  contenido: string = '';
  error = '';
  cargando = false;

  ngOnInit() {
    this.reservaId = Number(this.route.snapshot.paramMap.get('id'));
  }

  enviarComentario() {
    if (this.calificacion < 1 || this.calificacion > 5) {
      this.error = 'La calificación debe ser entre 1 y 5.';
      return;
    }

    if (this.contenido.trim().length < 10) {
      this.error = 'El comentario debe tener mínimo 10 caracteres.';
      return;
    }

    this.cargando = true;
    const usuarioId = this.auth.getCurrentUserId();

    this.comentarioService
      .crearComentario(this.reservaId, usuarioId, {
        calificacion: this.calificacion,
        contenido: this.contenido
      })
      .subscribe({
        next: () => {
          alert('Comentario enviado');
          this.router.navigate(['/mis-reservas']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al enviar comentario';
          this.cargando = false;
        }
      });
  }
}
