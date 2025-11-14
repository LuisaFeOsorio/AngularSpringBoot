import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './login/dashboard.component';
import { OlvidarContraseniaComponent } from './login/olvidarContrasenia/olvidar-contrasenia.component';
import {DashboardUsuarioComponent } from './home/usuario/home-usuario.component';
import { RegistroComponent } from './registro/registro-component';
import { MisReservasComponent } from './reserva/misReservas/mis-reservas.component';
import { CrearReservaComponent}from './reserva/crear/crear-reserva.component';
import { EditarAlojamientoComponent}from './alojamiento/editar/editar-alojamiento.component';
import { CrearAlojamientoComponent}from './alojamiento/crear/crear-alojamiento.component';
import { DashboardAnfitrionComponent}from './home/anfitrion/home-anfitrion.component';
import { DetalleAlojamientoComponent}from './alojamiento/detalles/detalle-alojamiento.component';
import {EditarUsuarioComponent} from './editar/usuario/editar-usuario.component';
import {EliminarAlojamientoComponent} from './alojamiento/eliminar/eliminar-alojamiento.component';
import {ReservasPendientesComponent} from './reserva/pendientes/reservas-pendientes.component';
import {ComentarReservaComponent} from './comentario/comentar-reserva.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'crear-alojamiento', component: CrearAlojamientoComponent },
  { path: 'comentar-reserva/:id', component: ComentarReservaComponent },
  { path: 'editar-alojamiento/:id', component: EditarAlojamientoComponent },
  { path: 'mis-reservas', component: MisReservasComponent },
  { path: 'home-anfitrion', component: DashboardAnfitrionComponent },
  { path: 'detalle-alojamiento/:id', component: DetalleAlojamientoComponent },
  { path: 'crear-reserva/:id', component: CrearReservaComponent },
  { path: 'reservas-pendientes/:id', component: ReservasPendientesComponent },
  { path: 'editar-usuario/:id', component: EditarUsuarioComponent },
  { path: 'olvidar-contrasenia', component: OlvidarContraseniaComponent },
  { path: 'registro-component', component: RegistroComponent },
  { path: 'eliminar-alojamiento/:id', component: EliminarAlojamientoComponent },
  { path: 'home-usuario', component: DashboardUsuarioComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [() => {
      if (!localStorage.getItem('token')) {
        window.location.href = '/login';
        return false;
      }
      return true;
    }]},
  { path: '', redirectTo: './auth/login/login.component', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
