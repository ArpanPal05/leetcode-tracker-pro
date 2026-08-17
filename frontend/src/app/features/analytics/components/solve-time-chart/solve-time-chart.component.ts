import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardActivity } from '../../models/analytics.models';

@Component({
  selector: 'app-solve-time-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="time-card">
      <div class="time-header">
        <h3>Solve Time Analysis</h3>
        <p>Comprehensive duration metrics for problem-solving sessions</p>
      </div>

      <div class="time-grid">
        <div class="time-box">
          <div class="time-icon-wrapper blue">
            <mat-icon>av_timer</mat-icon>
          </div>
          <div class="time-info">
            <span class="label">Average Time</span>
            <span class="value">{{ avgTime + ' mins' }}</span>
          </div>
        </div>

        <div class="time-box">
          <div class="time-icon-wrapper green">
            <mat-icon>speed</mat-icon>
          </div>
          <div class="time-info">
            <span class="label">Minimum Time</span>
            <span class="value">{{ minTime + ' mins' }}</span>
          </div>
        </div>

        <div class="time-box">
          <div class="time-icon-wrapper amber">
            <mat-icon>hourglass_full</mat-icon>
          </div>
          <div class="time-info">
            <span class="label">Maximum Time</span>
            <span class="value">{{ maxTime + ' mins' }}</span>
          </div>
        </div>

        <div class="time-box">
          <div class="time-icon-wrapper purple">
            <mat-icon>schedule</mat-icon>
          </div>
          <div class="time-info">
            <span class="label">Total Time Spent</span>
            <span class="value">{{ formatTotalTime(totalTime) }}</span>
          </div>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .time-card {
      background-color: #1e293b !important;
      color: #f8fafc !important;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .time-header {
      margin-bottom: 1.25rem;

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
    .time-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      width: 100%;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }
    .time-box {
      background-color: #0f172a;
      border-radius: 10px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.875rem;

      .time-icon-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 8px;
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
        &.amber { background: rgba(245,158,11,0.15); color: #f59e0b; }
        &.purple { background: rgba(168,85,247,0.15); color: #a855f7; }
      }

      .time-info {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;

        .label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
        }
        .value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #f8fafc;
        }
      }
    }
  `]
})
export class SolveTimeChartComponent {
  @Input() activity: DashboardActivity | null = null;

  get avgTime(): number {
    const stats = this.activity?.time_statistics;
    return stats?.average_minutes ?? stats?.avg_time_minutes ?? 0;
  }

  get minTime(): number {
    const stats = this.activity?.time_statistics;
    return stats?.minimum_minutes ?? stats?.min_time_minutes ?? 0;
  }

  get maxTime(): number {
    const stats = this.activity?.time_statistics;
    return stats?.maximum_minutes ?? stats?.max_time_minutes ?? 0;
  }

  get totalTime(): number {
    const stats = this.activity?.time_statistics;
    return stats?.total_minutes ?? stats?.total_time_minutes ?? 0;
  }

  formatTotalTime(minutes: number): string {
    if (minutes < 60) return `${minutes} mins`;
    const hours = (minutes / 60).toFixed(1);
    return `${hours} hrs`;
  }
}
