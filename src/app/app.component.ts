import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule,
} from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { AuthState } from './auth/auth.state';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatButtonModule,
    LayoutModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [],
})
export class AppComponent {
  title = 'Mineria Cripto 5.0';
  // Observable que emitirá true cuando estemos en un "handset" (móvil/tablet pequeño)
  isHandset$: Observable<boolean>;
  // Observable para el estado de autenticación
  authState$: Observable<AuthState>;

  constructor(
    protected authService: AuthService,
    protected router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {
    // Configuramos el breakpoint a utilizar (aquí Handset, tú podrías usar Breakpoints.Tablet, etc.)
    this.isHandset$ = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(
        map((result) => result.matches),
        shareReplay(1),
      );
    this.authState$ = this.authService.getAuthState();
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
