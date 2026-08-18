import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserTokenPayload } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoginRequest, RegisterRequest, User } from '../models/auth.models';
import { AuthApiService } from '../services/auth-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private authApiService = inject(AuthApiService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.initializeAuth();
  }

  initializeAuth(): void {
    if (this.authService.isAuthenticated()) {
      const payload = this.authService.currentUser();
      if (payload) {
        this.currentUser.set({
          username: (payload['sub'] as string) || (payload['username'] as string) || 'User',
          email: payload.email || (payload['sub'] as string) || ''
        });
        this.isAuthenticated.set(true);
      }
    } else {
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
    }
  }

  login(credentials: LoginRequest): void {
    this.loading.set(true);
    this.error.set(null);

    this.authApiService.login(credentials).subscribe({
      next: (response) => {
        this.authService.setToken(response.access_token);
        const payload: UserTokenPayload | null = this.authService.currentUser();

        const user: User = {
          username: (payload?.['username'] as string) || credentials.email.split('@')[0],
          email: credentials.email
        };

        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        this.loading.set(false);
        this.notificationService.success('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const rawErr = err?.error;
        let message = 'Invalid email or password.';

        if (typeof rawErr?.detail === 'string') {
          message = rawErr.detail;
        } else if (typeof rawErr?.message === 'string') {
          message = rawErr.message;
        } else if (typeof rawErr === 'string') {
          message = rawErr;
        } else if (err?.message && !err.message.includes('Http failure')) {
          message = err.message;
        }

        this.error.set(message);
        this.notificationService.error(message);
      }
    });
  }

  register(data: RegisterRequest): void {
    this.loading.set(true);
    this.error.set(null);

    this.authApiService.register(data).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.notificationService.success(response.message || 'Registration successful! Please log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message || 'Registration failed. Please try again.';
        this.error.set(message);
      }
    });
  }

  logout(): void {
    this.authService.clearToken();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.notificationService.info('You have been logged out.');
    this.router.navigate(['/login']);
  }
}
