import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-problems-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-table">
      <div class="skeleton-row skeleton-header"></div>
      <div *ngFor="let item of [1, 2, 3, 4, 5]" class="skeleton-row"></div>
    </div>
  `,
  styles: [`
    .skeleton-table {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
    }
    .skeleton-row {
      height: 40px;
      margin-bottom: 0.75rem;
      animation: pulse 1.5s infinite ease-in-out;
      background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
      background-size: 200% 100%;
      border-radius: 6px;

      &.skeleton-header {
        height: 28px;
        opacity: 0.7;
      }
    }
    @keyframes pulse {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class LoadingStateComponent {}
