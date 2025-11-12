import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-olvidar-contrasenia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: 'olvidar-contrasenia.component.html'
})
export class OlvidarContraseniaComponent implements OnInit {
  // Estados del flujo: 1 = Email, 2 = Código, 3 = Nueva contraseña
  pasoActual: number = 1;

  // Formularios
  formularioEmail!: FormGroup;
  formularioCodigo!: FormGroup;
  formularioContrasenia!: FormGroup;

  // Estados de UI
  isLoading: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';

  // Datos entre pasos
  email: string = '';
  codigo: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.inicializarFormularios();
  }

  private inicializarFormularios() {
    // Paso 1: Formulario de email
    this.formularioEmail = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Paso 2: Formulario de código
    this.formularioCodigo = this.fb.group({
      codigo: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern('^[0-9]*$')
      ]]
    });

    // Paso 3: Formulario de nueva contraseña
    this.formularioContrasenia = this.fb.group({
      nuevaContrasenia: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasenia: ['', [Validators.required]]
    }, { validators: this.passwordsIguales });
  }

  // Validador personalizado para contraseñas
  passwordsIguales(formGroup: AbstractControl) {
    const password = formGroup.get('nuevaContrasenia')?.value;
    const confirmPassword = formGroup.get('confirmarContrasenia')?.value;
    return password === confirmPassword ? null : { passwordsNoCoinciden: true };
  }

  // === PASO 1: SOLICITAR CÓDIGO ===
  solicitarCodigo() {
    if (this.formularioEmail.valid) {
      this.isLoading = true;
      this.mensajeError = '';
      this.mensajeExito = '';
      this.email = this.formularioEmail.value.email;

      this.http.post<any>('http://localhost:8080/api/contrasenia/solicitar-codigo', {
        email: this.email
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.error) {
            this.mensajeError = response.mensaje;
          } else {
            this.mensajeExito = response.mensaje;
            this.pasoActual = 2;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.mensajeError = error.error?.mensaje || 'Error al enviar el código de recuperación';
        }
      });
    } else {
      this.marcarCamposComoTocados(this.formularioEmail);
      this.mensajeError = 'Por favor, ingresa un email válido';
    }
  }

  // === PASO 2: VERIFICAR CÓDIGO ===
  verificarCodigo() {
    if (this.formularioCodigo.valid) {
      this.isLoading = true;
      this.mensajeError = '';
      this.mensajeExito = '';
      this.codigo = this.formularioCodigo.value.codigo;

      this.http.post<any>('http://localhost:8080/api/contrasenia/verificar-codigo', {
        email: this.email,
        codigo: this.codigo
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.error) {
            this.mensajeError = response.mensaje;
          } else {
            this.mensajeExito = response.mensaje;
            if (response.data === true) {
              this.pasoActual = 3;
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.mensajeError = error.error?.mensaje || 'Error al verificar el código';
        }
      });
    } else {
      this.marcarCamposComoTocados(this.formularioCodigo);
      this.mensajeError = 'Por favor, ingresa un código válido de 6 dígitos';
    }
  }

  // === PASO 3: RESTABLECER CONTRASEÑA ===
  restablecerContrasenia() {
    if (this.formularioContrasenia.valid) {
      this.isLoading = true;
      this.mensajeError = '';
      this.mensajeExito = '';

      console.log('DTO enviado:', {
        email: this.email,
        codigo: this.codigo,
        nuevaContrasenia: this.formularioContrasenia.value.nuevaContrasenia
      });

      this.http.post<any>('http://localhost:8080/api/contrasenia/restablecer', {
        email: this.email,
        codigo: this.codigo,
        nuevaContrasenia: this.formularioContrasenia.value.nuevaContrasenia

      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.error) {
            this.mensajeError = response.mensaje;
          } else {
            this.mensajeExito = '✅ ' + response.mensaje + ' Serás redirigido al login en 3 segundos.';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.mensajeError = error.error?.mensaje || 'Error al restablecer la contraseña';
        }
      });
    } else {
      this.marcarCamposComoTocados(this.formularioContrasenia);
      this.mensajeError = 'Por favor, completa todos los campos correctamente';
    }
  }

  // === MÉTODOS AUXILIARES ===

  volverPasoAnterior() {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      this.mensajeError = '';
      this.mensajeExito = '';
    }
  }

  reiniciarProceso() {
    this.pasoActual = 1;
    this.email = '';
    this.codigo = '';
    this.mensajeError = '';
    this.mensajeExito = '';
    this.inicializarFormularios();
  }

  volverALogin() {
    this.router.navigate(['/login']);
  }

  private marcarCamposComoTocados(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Getters para acceder fácilmente a los controles en el template
  get emailField() { return this.formularioEmail?.get('email'); }
  get codigoField() { return this.formularioCodigo?.get('codigo'); }
  get nuevaContraseniaField() { return this.formularioContrasenia?.get('nuevaContrasenia'); }
  get confirmarContraseniaField() { return this.formularioContrasenia?.get('confirmarContrasenia'); }
}
