import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardActivity, DashboardStreak, DashboardSummary } from '../../models/analytics.models';

@Component({
  selector: 'app-analytics-overview-cards',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="overview-grid">
      <div class="metric-card">
        <div class="icon-box blue"><mat-icon>assignment</mat-icon></div>
        <div class="metric-info">
          <span class="label">Total Tracked</span>
          <span class="value">{{ summary?.total_tracked ?? 0 }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="icon-box green"><mat-icon>check_circle</mat-icon></div>
        <div class="metric-info">
          <span class="label">Total Solved</span>
          <span class="value">{{ summary?.total_solved ?? 0 }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="icon-box red"><mat-icon>local_fire_department</mat-icon></div>
        <div class="metric-info">
          <span class="label">Current Streak</span>
          <span class="value">{{ (streak?.current_streak ?? 0) + ' Days' }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="icon-box amber"><mat-icon>emoji_events</mat-icon></div>
        <div class="metric-info">
          <span class="label">Longest Streak</span>
          <span class="value">{{ (streak?.longest_streak ?? 0) + ' Days' }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="icon-box purple"><mat-icon>timer</mat-icon></div>
        <div class="metric-info">
          <span class="label">Avg Solve Time</span>
          <span class="value">{{ getAvgSolveTime() }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1.25rem;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
      }
      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .metric-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }

      &.blue { background: rgba(59,130,246,0.15); color: #3b82f6; }
      &.green { background: rgba(16,185,129,0.15); color: #10b981; }
      &.red { background: rgba(239,68,68,0.15); color: #ef4444; }
      &.amber { background: rgba(245,158,11,0.15); color: #f59e0b; }
      &.purple { background: rgba(168,85,247,0.15); color: #a855f7; }
    }

    .metric-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .label {
        font-size: 0.75rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .value {
        font-size: 1.5rem;
        font-weight: 800;
        color: #f8fafc;
      }
    }
  `]
})
export class OverviewCardsComponent {
  @Input() summary: DashboardSummary | null = null;
  @Input() streak: DashboardStreak | null = null;
  @Input() activity: DashboardActivity | null = null;

  getAvgSolveTime(): string {
    const stats = this.activity?.time_statistics;
    const mins = stats?.average_minutes ?? stats?.avg_time_minutes ?? 0;
    if (mins === 0) return '0 mins';
    return `${mins} mins`;
  }
}
