import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { StorageService } from './storage.service';

export interface UserTokenPayload {
  sub?: string;
  email?: string;
  exp?: number;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storageService = inject(StorageService);
  private router = inject(Router);

  readonly currentUser = signal<UserTokenPayload | null>(this.getInitialUser());
  readonly isAuthenticated = signal<boolean>(this.hasValidToken());

  getToken(): string | null {
    return this.storageService.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  }

  setToken(token: string): void {
    this.storageService.set(STORAGE_KEYS.ACCESS_TOKEN, token);
    const user = this.decodeToken(token);
    this.currentUser.set(user);
    this.isAuthenticated.set(this.hasValidToken());
  }

  clearToken(): void {
    this.storageService.remove(STORAGE_KEYS.ACCESS_TOKEN);
    this.storageService.remove(STORAGE_KEYS.REFRESH_TOKEN);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  logout(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = jwtDecode<UserTokenPayload>(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private getInitialUser(): UserTokenPayload | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  private decodeToken(token: string): UserTokenPayload | null {
    try {
      return jwtDecode<UserTokenPayload>(token);
    } catch {
      return null;
    }
  }
}
