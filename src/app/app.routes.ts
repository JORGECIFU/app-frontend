// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SystemComponent } from './system/system.component';
import { AuthGuardService } from './auth/auth-guard.service';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'system',
    component: SystemComponent,
    canActivate: [AuthGuardService], // Protege ruta del lado del cliente
  },
  { path: '**', redirectTo: '/home' },
];
