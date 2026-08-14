import { inject, Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { StorageService } from './storage.service';

export type ActiveTheme = 'dark' | 'light';
const THEME_STORAGE_KEY = 'dsa_tracker_active_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private storageService = inject(StorageService);

  readonly currentTheme = signal<ActiveTheme>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggleTheme(): void {
    const nextTheme: ActiveTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: ActiveTheme): void {
    this.currentTheme.set(theme);
    this.storageService.set(THEME_STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ActiveTheme): void {
    const body = document.body;
    if (theme === 'light') {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    }
  }

  private getInitialTheme(): ActiveTheme {
    const stored = this.storageService.get<ActiveTheme>(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return 'dark';
  }
}
