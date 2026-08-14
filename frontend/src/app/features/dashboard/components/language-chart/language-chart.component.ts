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
import { LanguageCount } from '../../models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-language-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="chart-card">
      <div class="chart-header">
        <h3>Programming Languages</h3>
        <p>Problems solved per language</p>
      </div>

      <div class="chart-container">
        <canvas #canvas></canvas>
        <div *ngIf="isEmpty" class="chart-empty">No language data available</div>
      </div>
    </mat-card>
  `,
  styleUrl: './language-chart.component.scss'
})
export class LanguageChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() languages: LanguageCount[] | null = null;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  isEmpty = false;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['languages'] && !changes['languages'].firstChange) {
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

    const list = this.languages ?? [];
    if (list.length === 0) {
      this.isEmpty = true;
      return;
    }
    this.isEmpty = false;

    // Sort descending by count
    const sorted = [...list].sort((a, b) => b.count - a.count);
    const labels = sorted.map((item) => item.language);
    const counts = sorted.map((item) => item.count);

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Solved',
            data: counts,
            backgroundColor: '#3b82f6',
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
