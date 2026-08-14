import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserProfile } from '../../models/profile.models';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="profile-card">
      <div class="avatar-container">
        <div class="avatar-circle">
          <span>{{ getInitials() }}</span>
        </div>
      </div>

      <div class="profile-info-header">
        <h2>{{ profile?.full_name || profile?.username || 'DSA Engineer' }}</h2>
        <p class="email-text">{{ profile?.email || 'user@example.com' }}</p>
        <span class="member-badge">
          <mat-icon>verified</mat-icon>
          <span>Member since {{ (profile?.created_at | date: 'mediumDate') || '2026' }}</span>
        </span>
      </div>
    </mat-card>
  `,
  styles: [`
    .profile-card {
      background-color: #1e293b !important;
      color: #f8fafc !important;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 1.25rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .avatar-circle {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.25rem;
      font-weight: 800;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
    }
    .profile-info-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;

      h2 {
        font-size: 1.375rem;
        font-weight: 800;
        color: #f8fafc;
        margin: 0;
      }
      .email-text {
        font-size: 0.875rem;
        color: #94a3b8;
        margin: 0;
      }
    }
    .member-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background-color: rgba(59, 130, 246, 0.12);
      color: #3b82f6;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 0.5rem;

      mat-icon {
        font-size: 0.875rem;
        width: 0.875rem;
        height: 0.875rem;
      }
    }
  `]
})
export class ProfileCardComponent {
  @Input() profile: UserProfile | null = null;

  getInitials(): string {
    const name = this.profile?.full_name || this.profile?.username || 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
