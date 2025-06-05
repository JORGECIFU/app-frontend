import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './auth/jwt.interceptor';
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

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, // Añadir CommonModule aquí
    RouterOutlet,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatButtonModule,
    LayoutModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
})
export class AppComponent {
  title = 'Mineria Cripto 5.0';
  // Observable que emitirá true cuando estemos en un “handset” (móvil/tablet pequeño)
  isHandset$: Observable<boolean>;
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
  }

  onLogout() {
    this.authService.clearTokens();
    this.router.navigate(['/home']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
