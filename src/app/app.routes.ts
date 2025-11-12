import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './login/dashboard.component';
import { OlvidarContraseniaComponent } from './login/olvidar-contrasenia.component';
import {DashboardUsuarioComponent } from './home/home-usuario.component';
import { RegistroComponent } from './registro/registro-component';
import { MisReservasComponent } from './reserva/mis-reservas.component';
import { CrearReservaComponent}from './reserva/crear-reserva.component';
import { DetalleAlojamientoComponent}from './alojamiento/detalle-alojamiento.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'mis-reservas', component: MisReservasComponent },
  { path: 'detalle-alojamiento/:id', component: DetalleAlojamientoComponent },
  { path: 'crear-reserva/:id', component: CrearReservaComponent },
  { path: 'olvidar-contrasenia', component: OlvidarContraseniaComponent },
  { path: 'registro-component', component: RegistroComponent },
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
