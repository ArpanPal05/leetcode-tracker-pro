import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardStreak } from '../../models/analytics.models';

@Component({
  selector: 'app-analytics-streak-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="streak-card">
      <div class="streak-header">
        <div class="flame-box">
          <mat-icon>local_fire_department</mat-icon>
        </div>
        <div>
          <h3>Streak & Consistency Summary</h3>
          <p>Historical consistency milestones</p>
        </div>
      </div>

      <div class="streak-body">
        <div class="streak-row">
          <span class="label">Current Streak</span>
          <span class="value active">{{ (streak?.current_streak ?? 0) + ' Days' }}</span>
        </div>

        <div class="streak-row">
          <span class="label">Longest Historical Streak</span>
          <span class="value">{{ (streak?.longest_streak ?? 0) + ' Days' }}</span>
        </div>

        <div class="streak-row">
          <span class="label">Active Consistency Rating</span>
          <span class="value badge">{{ getConsistencyRating() }}</span>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .streak-card {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
      color: #f8fafc !important;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .streak-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;

      .flame-box {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background-color: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 1.5rem;
          width: 1.5rem;
          height: 1.5rem;
        }
      }

      h3 {
        font-size: 1.125rem;
        font-weight: 700;
        margin: 0 0 0.25rem 0;
        color: #f8fafc;
      }
      p {
        font-size: 0.8125rem;
        color: #94a3b8;
        margin: 0;
      }
    }
    .streak-body {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }
    .streak-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background-color: rgba(15, 23, 42, 0.6);
      border-radius: 8px;

      .label {
        font-size: 0.875rem;
        color: #94a3b8;
      }
      .value {
        font-size: 1rem;
        font-weight: 700;
        color: #f8fafc;

        &.active {
          color: #ef4444;
        }
        &.badge {
          background-color: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
        }
      }
    }
  `]
})
export class StreakSummaryComponent {
  @Input() streak: DashboardStreak | null = null;

  getConsistencyRating(): string {
    const current = this.streak?.current_streak ?? 0;
    if (current >= 14) return 'Master Practitioner 🔥';
    if (current >= 7) return 'Consistent Solver ⚡';
    if (current >= 3) return 'On a Roll 🚀';
    return 'Getting Started 🎯';
  }
}
