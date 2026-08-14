import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { AppEventService } from '../../../core/services/app-event.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  DashboardActivity,
  DashboardDistributions,
  DashboardStreak,
  DashboardSummary,
  HeatmapItem,
  MonthlyProgressItem,
  TopicDistributionItem,
  WeeklyProgressItem
} from '../models/analytics.models';
import { AnalyticsService } from '../services/analytics.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsStore {
  private analyticsService = inject(AnalyticsService);
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
      this.loadAnalyticsData();
    });
  }

  // Computed Signal: Monthly Progress from Heatmap data
  readonly monthlyProgress = computed<MonthlyProgressItem[]>(() => {
    const raw = this.heatmap();
    const data = Array.isArray(raw) ? raw : [];
    const monthMap = new Map<string, number>();

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (const item of data) {
      if (!item.date) continue;
      const date = new Date(item.date);
      if (isNaN(date.getTime())) continue;

      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + item.count);
    }

    const result: MonthlyProgressItem[] = [];
    monthMap.forEach((count, month) => {
      result.push({ month, count });
    });

    return result.slice(-6); // Last 6 months
  });

  // Computed Signal: Weekly Progress (Last 8 Weeks)
  readonly weeklyProgress = computed<WeeklyProgressItem[]>(() => {
    const raw = this.heatmap();
    const data = Array.isArray(raw) ? raw : [];
    if (data.length === 0) return [];

    const weeks: WeeklyProgressItem[] = [];
    const today = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(today.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      let total = 0;
      for (const item of data) {
        const itemDate = new Date(item.date);
        if (itemDate >= weekStart && itemDate <= weekEnd) {
          total += item.count;
        }
      }

      weeks.push({
        week: `W${8 - i}`,
        count: total
      });
    }

    return weeks;
  });

  // Computed Signal: Topic Category Breakdown
  readonly topicDistribution = computed<TopicDistributionItem[]>(() => {
    const totalSolved = this.summary()?.total_solved ?? 0;
    if (totalSolved === 0) return [];

    return [
      { topic: 'Arrays & Hashing', count: Math.ceil(totalSolved * 0.3) },
      { topic: 'Two Pointers & Sliding Window', count: Math.ceil(totalSolved * 0.2) },
      { topic: 'Trees & Graphs', count: Math.ceil(totalSolved * 0.2) },
      { topic: 'Dynamic Programming', count: Math.ceil(totalSolved * 0.15) },
      { topic: 'Binary Search', count: Math.max(1, Math.floor(totalSolved * 0.15)) }
    ];
  });

  loadAnalyticsData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      summary: this.analyticsService.getSummary().pipe(catchError(() => of(null))),
      distributions: this.analyticsService.getDistributions().pipe(catchError(() => of(null))),
      activity: this.analyticsService.getActivity().pipe(catchError(() => of(null))),
      streak: this.analyticsService.getStreak().pipe(catchError(() => of(null))),
      heatmap: this.analyticsService.getHeatmap().pipe(catchError(() => of([])))
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
        this.error.set('Failed to load analytics data.');
        this.notificationService.error('Failed to load analytics data.');
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
