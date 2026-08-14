import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule
  ],
  template: `
    <aside class="sidebar-container">
      <div class="nav-section">
        <mat-nav-list class="nav-list">
          <a
            *ngFor="let item of navItems"
            mat-list-item
            [routerLink]="item.route"
            routerLinkActive="active-nav-item"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="navClicked.emit()"
            class="nav-link"
          >
            <mat-icon matListItemIcon class="nav-icon">{{ item.icon }}</mat-icon>
            <span matListItemTitle class="nav-label">{{ item.label }}</span>
          </a>
        </mat-nav-list>
      </div>

      <div class="bottom-section">
        <mat-divider></mat-divider>
        <mat-nav-list class="nav-list">
          <a
            mat-list-item
            (click)="onLogout()"
            class="nav-link logout-link"
          >
            <mat-icon matListItemIcon class="nav-icon logout-icon">logout</mat-icon>
            <span matListItemTitle class="nav-label logout-label">Logout</span>
          </a>
        </mat-nav-list>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--color-surface);
      color: var(--color-text-primary);
      border-right: 1px solid var(--color-border);
      padding: 0.75rem 0.5rem;
      user-select: none;
      transition: background-color 0.25s ease-in-out, border-color 0.25s ease-in-out;
    }

    .nav-section {
      flex: 1;
      overflow-y: auto;
    }

    .nav-list {
      padding-top: 0;
      padding-bottom: 0;
    }

    .nav-link {
      border-radius: 8px;
      margin-bottom: 0.375rem;
      color: var(--color-text-secondary) !important;
      transition: all 0.15s ease-in-out;

      &:hover {
        background-color: var(--color-surface-hover) !important;
        color: var(--color-text-primary) !important;

        .nav-icon {
          color: #3b82f6;
        }
      }
    }

    .active-nav-item {
      background-color: rgba(59, 130, 246, 0.15) !important;
      color: #3b82f6 !important;
      font-weight: 600;

      .nav-icon {
        color: #3b82f6 !important;
      }
    }

    .nav-icon {
      color: var(--color-text-muted);
      margin-right: 0.75rem;
    }

    .nav-label {
      font-size: 0.9375rem;
    }

    .bottom-section {
      margin-top: auto;
      padding-top: 0.5rem;

      mat-divider {
        border-top-color: var(--color-border);
        margin-bottom: 0.5rem;
      }
    }

    .logout-link {
      color: #ef4444 !important;
      &:hover {
        background-color: rgba(239, 68, 68, 0.1) !important;
        color: #ef4444 !important;

        .logout-icon {
          color: #ef4444 !important;
        }
      }
    }

    .logout-icon {
      color: #ef4444;
    }
  `]
})
export class SidebarComponent {
  @Output() navClicked = new EventEmitter<void>();

  private authService = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Track Problem', route: '/tracker', icon: 'add_circle_outline' },
    { label: 'My Problems', route: '/my-problems', icon: 'format_list_bulleted' },
    { label: 'Analytics', route: '/analytics', icon: 'insights' },
    { label: 'Profile', route: '/profile', icon: 'person' }
  ];

  onLogout(): void {
    this.navClicked.emit();
    this.authService.logout();
  }
}
