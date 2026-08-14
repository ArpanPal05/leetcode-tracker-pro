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
import { DifficultyDistribution } from '../../models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-difficulty-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="chart-card">
      <div class="chart-header">
        <h3>Difficulty Breakdown</h3>
        <p>Distribution of tracked problems by difficulty</p>
      </div>

      <div class="chart-container">
        <canvas #canvas></canvas>
        <div *ngIf="isEmpty" class="chart-empty">No difficulty data available</div>
      </div>
    </mat-card>
  `,
  styleUrl: './difficulty-chart.component.scss'
})
export class DifficultyChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() difficulty: DifficultyDistribution | null = null;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  isEmpty = false;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['difficulty'] && !changes['difficulty'].firstChange) {
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

    const easy = this.difficulty?.easy ?? 0;
    const medium = this.difficulty?.medium ?? 0;
    const hard = this.difficulty?.hard ?? 0;

    if (easy === 0 && medium === 0 && hard === 0) {
      this.isEmpty = true;
      return;
    }
    this.isEmpty = false;

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [
          {
            data: [easy, medium, hard],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderColor: '#1e293b',
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 12 },
              padding: 16
            }
          }
        },
        cutout: '70%'
      }
    });
  }
}
