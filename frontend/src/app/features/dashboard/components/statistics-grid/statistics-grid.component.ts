import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DashboardStreak, DashboardSummary } from '../../models/dashboard.models';
import { SummaryCardComponent } from '../summary-card/summary-card.component';

@Component({
  selector: 'app-statistics-grid',
  standalone: true,
  imports: [CommonModule, SummaryCardComponent],
  template: `
    <div class="statistics-grid">
      <app-summary-card
        title="Tracked Problems"
        [value]="summary?.total_tracked ?? 0"
        icon="assignment"
        iconBgColor="rgba(59, 130, 246, 0.15)"
        iconColor="#3b82f6"
        subtitle="Total problems in list"
      />

      <app-summary-card
        title="Solved Problems"
        [value]="summary?.total_solved ?? 0"
        icon="check_circle"
        iconBgColor="rgba(16, 185, 129, 0.15)"
        iconColor="#10b981"
        [subtitle]="getSolvedPercentage()"
      />

      <app-summary-card
        title="Favorites"
        [value]="summary?.favorites ?? 0"
        icon="star"
        iconBgColor="rgba(245, 158, 11, 0.15)"
        iconColor="#f59e0b"
        subtitle="Starred problems"
      />

      <app-summary-card
        title="Current Streak"
        [value]="(streak?.current_streak ?? 0) + ' Days'"
        icon="local_fire_department"
        iconBgColor="rgba(239, 68, 68, 0.15)"
        iconColor="#ef4444"
        [subtitle]="'Best: ' + (streak?.longest_streak ?? 0) + ' Days'"
      />
    </div>
  `,
  styleUrl: './statistics-grid.component.scss'
})
export class StatisticsGridComponent {
  @Input() summary: DashboardSummary | null = null;
  @Input() streak: DashboardStreak | null = null;

  getSolvedPercentage(): string {
    if (!this.summary || this.summary.total_tracked === 0) {
      return '0% completion rate';
    }
    const pct = Math.round((this.summary.total_solved / this.summary.total_tracked) * 100);
    return `${pct}% completion rate`;
  }
}
