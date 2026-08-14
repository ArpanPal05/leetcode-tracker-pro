import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tracker-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card">
      <div class="skeleton-pulse skeleton-header"></div>
      <div *ngFor="let item of [1, 2, 3, 4]" class="skeleton-pulse skeleton-field"></div>
    </div>
  `,
  styleUrl: './loading-state.component.scss'
})
export class LoadingStateComponent {}
