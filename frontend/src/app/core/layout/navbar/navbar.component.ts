import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <header class="navbar">
      <div class="navbar-left">
        <button
          mat-icon-button
          type="button"
          (click)="toggleSidebar.emit()"
          class="menu-toggle-btn"
          aria-label="Toggle navigation menu"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <div class="brand" routerLink="/dashboard">
          <mat-icon class="brand-icon">code</mat-icon>
          <span class="brand-title">DSA Tracker Pro</span>
        </div>
      </div>

      <div class="navbar-right">
        <!-- Theme Toggle Button -->
        <button
          mat-icon-button
          type="button"
          (click)="themeService.toggleTheme()"
          aria-label="Toggle light and dark theme"
          class="icon-btn"
          [title]="themeService.currentTheme() === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <mat-icon>{{ themeService.currentTheme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>

        <!-- User Menu Dropdown -->
        <ng-container *ngIf="authService.isAuthenticated()">
          <button
            mat-button
            [matMenuTriggerFor]="userMenu"
            class="user-menu-btn"
            aria-label="User account menu"
          >
            <div class="avatar-circle">
              {{ getUserInitial() }}
            </div>
            <span class="username-text">{{ getUsername() }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu" xPosition="before" class="app-user-menu">
            <div class="menu-header">
              <p class="menu-user-name">{{ getUsername() }}</p>
              <p class="menu-user-email">{{ getEmail() }}</p>
            </div>
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>My Profile</span>
            </button>
            <button mat-menu-item (click)="onLogout()">
              <mat-icon color="warn">logout</mat-icon>
              <span class="warn-text">Logout</span>
            </button>
          </mat-menu>
        </ng-container>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: 64px;
      padding: 0 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-primary);
      z-index: 100;
      transition: background-color 0.25s ease-in-out, border-color 0.25s ease-in-out;
    }

    .navbar-left,
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .menu-toggle-btn {
      color: var(--color-text-secondary);
      &:hover {
        color: var(--color-text-primary);
      }
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;

      .brand-icon {
        color: #3b82f6;
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }

      .brand-title {
        font-weight: 700;
        font-size: 1.125rem;
        color: var(--color-text-primary);
        letter-spacing: -0.01em;
      }
    }

    .icon-btn {
      color: var(--color-text-secondary);
      &:hover {
        color: var(--color-text-primary);
      }
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-text-primary);
      padding: 0.25rem 0.5rem;
      border-radius: 8px;

      .username-text {
        font-weight: 600;
        font-size: 0.875rem;
      }
    }

    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #3b82f6;
      color: #ffffff;
      font-weight: 700;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
    }

    .menu-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 0.25rem;

      .menu-user-name {
        font-weight: 700;
        font-size: 0.875rem;
        color: var(--color-text-primary);
        margin: 0;
      }
      .menu-user-email {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        margin: 0;
      }
    }

    .warn-text {
      color: #ef4444;
    }

    @media (max-width: 600px) {
      .brand-title {
        display: none;
      }
      .username-text {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  getUsername(): string {
    const user = this.authService.currentUser();
    const email = user?.email ?? (typeof user?.sub === 'string' ? user.sub : 'User');
    return email.split('@')[0];
  }

  getEmail(): string {
    const user = this.authService.currentUser();
    return user?.email ?? (typeof user?.sub === 'string' ? user.sub : 'user@example.com');
  }

  getUserInitial(): string {
    const username = this.getUsername();
    return username ? username.charAt(0).toUpperCase() : 'U';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
