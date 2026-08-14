import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { AppEventService } from '../../../core/services/app-event.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  DashboardActivity,
  DashboardDistributions,
  DashboardStreak,
  DashboardSummary,
  HeatmapItem
} from '../models/dashboard.models';
import { DashboardService } from '../services/dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  private dashboardService = inject(DashboardService);
  private notificationService = inject(NotificationService);
  private appEventService = inject(AppEventService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly distributions = signal<DashboardDistributions | null>(null);
  readonly activity = signal<DashboardActivity | null>(null);
  readonly streak = signal<DashboardStreak | null>(null);
  readonly heatmap = signal<HeatmapItem[] | null>(null);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.appEventService.problemChanged$.subscribe(() => {
      this.loadDashboardData();
    });
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      summary: this.dashboardService.getSummary().pipe(catchError(() => of(null))),
      distributions: this.dashboardService.getDistributions().pipe(catchError(() => of(null))),
      activity: this.dashboardService.getActivity().pipe(catchError(() => of(null))),
      streak: this.dashboardService.getStreak().pipe(catchError(() => of(null))),
      heatmap: this.dashboardService.getHeatmap().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.summary.set(res.summary);
        this.distributions.set(res.distributions);
        this.activity.set(res.activity);
        this.streak.set(res.streak);
        this.heatmap.set(res.heatmap);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load dashboard statistics.');
        this.notificationService.error('Failed to load dashboard statistics.');
      }
    });
  }

  reset(): void {
    this.summary.set(null);
    this.distributions.set(null);
    this.activity.set(null);
    this.streak.set(null);
    this.heatmap.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}
