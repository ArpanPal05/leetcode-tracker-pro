import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserStatistics } from '../../models/profile.models';

@Component({
  selector: 'app-profile-statistics-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="stats-grid">
      <div class="stat-box">
        <div class="icon-wrapper blue"><mat-icon>assignment</mat-icon></div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics?.total_tracked ?? 0 }}</span>
          <span class="stat-label">Total Tracked</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="icon-wrapper green"><mat-icon>check_circle</mat-icon></div>
        <div class="stat-details">
          <span class="stat-value">{{ statistics?.total_solved ?? 0 }}</span>
          <span class="stat-label">Total Solved</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="icon-wrapper red"><mat-icon>local_fire_department</mat-icon></div>
        <div class="stat-details">
          <span class="stat-value">{{ (statistics?.current_streak ?? 0) + 'd' }}</span>
          <span class="stat-label">Current Streak</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="icon-wrapper amber"><mat-icon>emoji_events</mat-icon></div>
        <div class="stat-details">
          <span class="stat-value">{{ (statistics?.longest_streak ?? 0) + 'd' }}</span>
          <span class="stat-label">Longest Streak</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      width: 100%;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }
    .stat-box {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
      }

      &.blue { background: rgba(59,130,246,0.15); color: #3b82f6; }
      &.green { background: rgba(16,185,129,0.15); color: #10b981; }
      &.red { background: rgba(239,68,68,0.15); color: #ef4444; }
      &.amber { background: rgba(245,158,11,0.15); color: #f59e0b; }
    }
    .stat-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;

      .stat-value {
        font-size: 1.25rem;
        font-weight: 800;
        color: #f8fafc;
      }
      .stat-label {
        font-size: 0.75rem;
        color: #94a3b8;
        text-transform: uppercase;
      }
    }
  `]
})
export class StatisticsSummaryComponent {
  @Input() statistics: UserStatistics | null = null;
}
