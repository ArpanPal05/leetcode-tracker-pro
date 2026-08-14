import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeatmapItem } from '../../models/dashboard.models';

export interface CalendarDay {
  dateStr: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTooltipModule],
  template: `
    <mat-card class="heatmap-card">
      <div class="heatmap-header">
        <h3>Solve Activity Heatmap</h3>
        <p>Your problem-solving activity over the past year</p>
      </div>

      <div class="heatmap-wrapper">
        <div class="heatmap-grid">
          <div
            *ngFor="let day of calendarDays"
            class="heatmap-cell"
            [style.background-color]="day.color"
            [matTooltip]="day.dateStr + ': ' + day.count + ' problem(s) solved'"
          ></div>
        </div>
      </div>

      <div class="heatmap-legend">
        <span>Less</span>
        <div class="legend-cells">
          <div class="heatmap-cell" style="background-color: #334155;"></div>
          <div class="heatmap-cell" style="background-color: #065f46;"></div>
          <div class="heatmap-cell" style="background-color: #047857;"></div>
          <div class="heatmap-cell" style="background-color: #10b981;"></div>
          <div class="heatmap-cell" style="background-color: #34d399;"></div>
        </div>
        <span>More</span>
      </div>
    </mat-card>
  `,
  styleUrl: './heatmap.component.scss'
})
export class HeatmapComponent implements OnChanges {
  @Input() data: HeatmapItem[] | null = null;

  calendarDays: CalendarDay[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.generateCalendar();
    }
  }

  private generateCalendar(): void {
    const countsMap = new Map<string, number>();
    if (this.data) {
      for (const item of this.data) {
        countsMap.set(item.date, item.count);
      }
    }

    const days: CalendarDay[] = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const count = countsMap.get(dateStr) ?? 0;
      days.push({
        dateStr,
        count,
        color: this.getColor(count)
      });
    }

    this.calendarDays = days;
  }

  private getColor(count: number): string {
    if (count === 0) return '#334155';
    if (count === 1) return '#065f46';
    if (count === 2) return '#047857';
    if (count === 3) return '#10b981';
    return '#34d399';
  }
}
