// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SystemComponent } from './system/system.component';
import { AuthGuardService } from './auth/auth-guard.service';
import { PasarelaPagosComponent } from './pasarela-pagos/pasarela-pagos.component';
import { RegistrarUsuarioComponent } from './registrar-usuario/registrar-usuario.component';
import { PlanComponent } from './plan/plan.component';
import { MaquinaComponent } from './maquina/maquina.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrar-usuario', component: RegistrarUsuarioComponent },
  { path: 'pasarela-pagos', component: PasarelaPagosComponent },
  {
    path: 'system',
    component: SystemComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: 'plan', component: PlanComponent },
      { path: 'maquina', component: MaquinaComponent },
      { path: '', redirectTo: 'plan', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/home' },
];
