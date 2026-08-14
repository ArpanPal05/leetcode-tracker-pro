import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardStreak } from '../../models/dashboard.models';

@Component({
  selector: 'app-streak-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="streak-card">
      <div class="streak-header">
        <div class="flame-icon-wrapper">
          <mat-icon>local_fire_department</mat-icon>
        </div>
        <div>
          <h3>Solve Streak</h3>
        </div>
      </div>

      <div class="streak-metrics">
        <div class="metric-box">
          <span class="label">Current Streak</span>
          <span class="value highlight">{{ streak?.current_streak ?? 0 }} Days</span>
        </div>

        <div class="metric-box">
          <span class="label">Longest Streak</span>
          <span class="value">{{ streak?.longest_streak ?? 0 }} Days</span>
        </div>
      </div>
    </mat-card>
  `,
  styleUrl: './streak-card.component.scss'
})
export class StreakCardComponent {
  @Input() streak: DashboardStreak | null = null;
}
