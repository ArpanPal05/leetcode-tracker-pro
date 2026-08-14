import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-analytics-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="empty-card">
      <div class="icon-circle">
        <mat-icon>insights</mat-icon>
      </div>
      <h3>No Analytics Available Yet</h3>
      <p>Start tracking and solving problems to unlock detailed historical trends, speed metrics, and topic distribution charts!</p>
      <button mat-raised-button color="primary" routerLink="/tracker">
        <mat-icon>add</mat-icon>
        <span>Track Your First Problem</span>
      </button>
    </div>
  `,
  styles: [`
    .empty-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 3rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    .icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }
    }
    h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }
    p {
      color: #94a3b8;
      font-size: 0.875rem;
      max-width: 440px;
      margin: 0;
    }
  `]
})
export class EmptyStateComponent {}
