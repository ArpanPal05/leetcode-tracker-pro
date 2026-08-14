import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-analytics-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-grid">
      <div *ngFor="let item of [1, 2, 3, 4]" class="skeleton-card">
        <div class="skeleton-pulse skeleton-header"></div>
        <div class="skeleton-pulse skeleton-body"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }
    .skeleton-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
      height: 240px;
    }
    .skeleton-pulse {
      animation: pulse 1.5s infinite ease-in-out;
      background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
      background-size: 200% 100%;
      border-radius: 6px;
    }
    .skeleton-header {
      height: 20px;
      width: 40%;
      margin-bottom: 1.5rem;
    }
    .skeleton-body {
      height: 140px;
      width: 100%;
    }
    @keyframes pulse {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class LoadingStateComponent {}
