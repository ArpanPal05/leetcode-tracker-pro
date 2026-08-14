import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="error-page-container animate-fade-in">
      <div class="error-code">500</div>
      <div class="icon-circle">
        <mat-icon>dns</mat-icon>
      </div>
      <h2>Internal Server Error</h2>
      <p>Something went wrong on our end. Please refresh or try again in a few moments.</p>
      <div class="action-row">
        <button mat-raised-button color="primary" (click)="onReload()">
          <mat-icon>refresh</mat-icon>
          <span>Reload Page</span>
        </button>
        <button mat-stroked-button color="accent" routerLink="/dashboard">
          <mat-icon>home</mat-icon>
          <span>Go to Dashboard</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-page-container {
      min-height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      gap: 1.25rem;
    }
    .error-code {
      font-size: 5rem;
      font-weight: 900;
      color: rgba(239, 68, 68, 0.25);
      letter-spacing: 0.1em;
      line-height: 1;
    }
    .icon-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background-color: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: -1.5rem;

      mat-icon {
        font-size: 2.25rem;
        width: 2.25rem;
        height: 2.25rem;
      }
    }
    h2 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0;
    }
    p {
      color: #94a3b8;
      font-size: 1rem;
      max-width: 460px;
      margin: 0;
    }
    .action-row {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }
  `]
})
export class ServerErrorComponent {
  onReload(): void {
    window.location.reload();
  }
}
