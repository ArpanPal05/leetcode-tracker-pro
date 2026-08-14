import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-grid">
      <div *ngFor="let item of [1, 2, 3, 4]" class="skeleton-card">
        <div class="skeleton-pulse skeleton-title"></div>
        <div class="skeleton-pulse skeleton-value"></div>
      </div>
    </div>
  `,
  styleUrl: './loading-state.component.scss'
})
export class LoadingStateComponent {}
