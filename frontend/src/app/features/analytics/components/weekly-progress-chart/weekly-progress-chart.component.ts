import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Chart, registerables } from 'chart.js/auto';
import { WeeklyProgressItem } from '../../models/analytics.models';

Chart.register(...registerables);

@Component({
  selector: 'app-weekly-progress-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="chart-card">
      <div class="chart-header">
        <h3>Weekly Solve Velocity</h3>
        <p>Recent weekly solve performance over the last 8 weeks</p>
      </div>

      <div class="chart-container">
        <canvas #canvas></canvas>
        <div *ngIf="isEmpty" class="chart-empty">No weekly activity data available</div>
      </div>
    </mat-card>
  `,
  styles: [`
    .chart-card {
      background-color: #1e293b !important;
      color: #f8fafc !important;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
      height: 100%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .chart-header {
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
    .chart-container {
      position: relative;
      height: 260px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chart-empty {
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }
  `]
})
export class WeeklyProgressChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: WeeklyProgressItem[] = [];
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  isEmpty = false;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private renderChart(): void {
    if (!this.canvasRef?.nativeElement) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    if (!this.data || this.data.length === 0) {
      this.isEmpty = true;
      return;
    }
    this.isEmpty = false;

    const labels = this.data.map((i) => i.week);
    const counts = this.data.map((i) => i.count);

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Problems Solved',
            data: counts,
            backgroundColor: '#10b981',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#94a3b8', stepSize: 1 },
            grid: { color: '#334155' }
          }
        }
      }
    });
  }
}
