import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DifficultyChartComponent } from '../../../dashboard/components/difficulty-chart/difficulty-chart.component';
import { HeatmapComponent } from '../../../dashboard/components/heatmap/heatmap.component';
import { LanguageChartComponent } from '../../../dashboard/components/language-chart/language-chart.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import { MonthlyProgressChartComponent } from '../../components/monthly-progress-chart/monthly-progress-chart.component';
import { OverviewCardsComponent } from '../../components/overview-cards/overview-cards.component';
import { SolveTimeChartComponent } from '../../components/solve-time-chart/solve-time-chart.component';
import { StreakSummaryComponent } from '../../components/streak-summary/streak-summary.component';
import { TopicDistributionChartComponent } from '../../components/topic-distribution-chart/topic-distribution-chart.component';
import { WeeklyProgressChartComponent } from '../../components/weekly-progress-chart/weekly-progress-chart.component';
import { AnalyticsStore } from '../../store/analytics.store';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    LoadingStateComponent,
    EmptyStateComponent,
    OverviewCardsComponent,
    DifficultyChartComponent,
    LanguageChartComponent,
    MonthlyProgressChartComponent,
    WeeklyProgressChartComponent,
    TopicDistributionChartComponent,
    SolveTimeChartComponent,
    StreakSummaryComponent,
    HeatmapComponent
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  readonly analyticsStore = inject(AnalyticsStore);

  ngOnInit(): void {
    this.analyticsStore.loadAnalyticsData();
  }
}
