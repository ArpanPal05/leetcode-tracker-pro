import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="summary-card">
      <div
        class="icon-wrapper"
        [style.background-color]="iconBgColor"
        [style.color]="iconColor"
      >
        <mat-icon>{{ icon }}</mat-icon>
      </div>

      <div class="content-wrapper">
        <span class="card-title">{{ title }}</span>
        <span class="card-value">{{ value }}</span>
        <span *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</span>
      </div>
    </mat-card>
  `,
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number | string;
  @Input({ required: true }) icon!: string;
  @Input() iconBgColor: string = 'rgba(59, 130, 246, 0.15)';
  @Input() iconColor: string = '#3b82f6';
  @Input() subtitle?: string;
}
