import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile-logout-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="logout-card">
      <div class="card-header">
        <mat-icon color="warn">logout</mat-icon>
        <div>
          <h3>Account Security & Session</h3>
          <p>Securely end your current session across devices</p>
        </div>
      </div>

      <div class="card-actions">
        <button mat-raised-button color="warn" type="button" (click)="onLogout()">
          <mat-icon>power_settings_new</mat-icon>
          <span>Log Out of Account</span>
        </button>
      </div>
    </mat-card>
  `,
  styles: [`
    .logout-card {
      background-color: #1e293b !important;
      color: #f8fafc !important;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

      @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;

      mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }

      h3 {
        font-size: 1.125rem;
        font-weight: 700;
        color: #f8fafc;
        margin: 0 0 0.25rem 0;
      }
      p {
        font-size: 0.8125rem;
        color: #94a3b8;
        margin: 0;
      }
    }
  `]
})
export class LogoutCardComponent {
  private authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
