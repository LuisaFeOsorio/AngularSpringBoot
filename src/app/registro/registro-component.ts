import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './registro-component.html'
})
export class RegistroComponent {
  registroForm: FormGroup;
  isLoading = false;
  mensajeError = '';
  mensajeExito = '';
  archivoSeleccionado: File | null = null;
  vistaPreviaImagen: string | ArrayBuffer | null = null;

  // Opción para registrarse como anfitrión
  esAnfitrion = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      fechaNacimiento: ['', [Validators.required]],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasenia: ['', [Validators.required]],
      fotoPerfil: [''],
    }, { validators: this.passwordsIguales });
  }

  passwordsIguales(formGroup: FormGroup) {
    const password = formGroup.get('contrasenia')?.value;
    const confirmPassword = formGroup.get('confirmarContrasenia')?.value;
    return password === confirmPassword ? null : { passwordsNoCoinciden: true };
  }

  // Toggle para anfitrión
  toggleAnfitrion() {
    this.esAnfitrion = !this.esAnfitrion;
    console.log('🎭 Modo anfitrión:', this.esAnfitrion);
  }

  // Manejar selección de archivo
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!tiposPermitidos.includes(file.type)) {
        this.mensajeError = 'Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)';
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.mensajeError = 'La imagen no debe superar los 2MB';
        return;
      }

      this.archivoSeleccionado = file;

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e) => {
        this.vistaPreviaImagen = reader.result;
      };
      reader.readAsDataURL(file);

      this.mensajeError = '';
    }
  }

  // Remover imagen seleccionada
  removerImagen() {
    this.archivoSeleccionado = null;
    this.vistaPreviaImagen = null;
    this.registroForm.patchValue({ fotoPerfil: '' });
  }

  // Calcular edad mínima (18 años)
  getFechaMaximaNacimiento(): string {
    const hoy = new Date();
    const fechaMinima = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    return fechaMinima.toISOString().split('T')[0];
  }

  // Calcular edad mínima (13 años)
  getFechaMinimaNacimiento(): string {
    const hoy = new Date();
    const fechaMaxima = new Date(hoy.getFullYear() - 100, hoy.getMonth(), hoy.getDate());
    return fechaMaxima.toISOString().split('T')[0];
  }

  registrar() {
    this.registroForm.markAllAsTouched();

    if (this.registroForm.valid) {
      this.isLoading = true;
      this.mensajeError = '';
      this.mensajeExito = '';

      // Preparar datos del formulario
      const formData = new FormData();
      formData.append('nombre', this.registroForm.value.nombre);
      formData.append('apellido', this.registroForm.value.apellido);
      formData.append('email', this.registroForm.value.email);
      formData.append('telefono', this.registroForm.value.telefono || '');
      formData.append('fechaNacimiento', this.registroForm.value.fechaNacimiento);
      formData.append('contrasenia', this.registroForm.value.contrasenia);

      // Asignar rol según la selección
      formData.append('rol', this.esAnfitrion ? 'ANFITRION' : 'USUARIO');

      // Agregar archivo si existe
      if (this.archivoSeleccionado) {
        formData.append('fotoPerfil', this.archivoSeleccionado);
      }

      console.log('📤 Enviando registro como:', this.esAnfitrion ? 'ANFITRION' : 'USUARIO');

      this.http.post<any>('http://localhost:8080/api/usuarios/registro', formData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            console.log('✅ Registro exitoso:', response);

            const tipoUsuario = this.esAnfitrion ? 'anfitrión' : 'usuario';
            this.mensajeExito = `¡Registro exitoso! Ahora eres ${tipoUsuario}. ` + (response.mensaje || '');

            // 🔥 REDIRECCIÓN INTELIGENTE SEGÚN EL ROL
            setTimeout(() => {
              if (this.esAnfitrion) {
                // Si es anfitrión, va a crear alojamiento
                console.log('➡️ Redirigiendo anfitrión a crear alojamiento');
                this.router.navigate(['/crear-alojamiento']);
              } else {
                // Si es usuario, va a crear reserva
                console.log('➡️ Redirigiendo usuario a crear reserva');
                this.router.navigate(['/crear-reserva']);
              }
            }, 2000); // 2 segundos para que el usuario vea el mensaje

          },
          error: (error) => {
            this.isLoading = false;
            console.error('❌ Error en registro:', error);

            if (error.status === 409) {
              this.mensajeError = 'El email ya está registrado';
            } else if (error.status === 400) {
              this.mensajeError = 'Datos inválidos: ' + (error.error?.mensaje || 'Verifica los campos');
            } else {
              this.mensajeError = error.error?.mensaje || 'Error del servidor. Intenta más tarde.';
            }
          }
        });
    } else {
      this.mensajeError = 'Por favor, completa todos los campos requeridos correctamente.';
    }
  }

  // Getters para validación
  get nombre() { return this.registroForm.get('nombre'); }
  get apellido() { return this.registroForm.get('apellido'); }
  get email() { return this.registroForm.get('email'); }
  get fechaNacimiento() { return this.registroForm.get('fechaNacimiento'); }
  get contrasenia() { return this.registroForm.get('contrasenia'); }
  get confirmarContrasenia() { return this.registroForm.get('confirmarContrasenia'); }
}
