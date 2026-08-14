import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DifficultyChartComponent } from '../../components/difficulty-chart/difficulty-chart.component';
import { HeatmapComponent } from '../../components/heatmap/heatmap.component';
import { LanguageChartComponent } from '../../components/language-chart/language-chart.component';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import { RecentActivityComponent } from '../../components/recent-activity/recent-activity.component';
import { StatisticsGridComponent } from '../../components/statistics-grid/statistics-grid.component';
import { StreakCardComponent } from '../../components/streak-card/streak-card.component';
import { DashboardStore } from '../../store/dashboard.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LoadingStateComponent,
    StatisticsGridComponent,
    DifficultyChartComponent,
    LanguageChartComponent,
    RecentActivityComponent,
    StreakCardComponent,
    HeatmapComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly dashboardStore = inject(DashboardStore);

  ngOnInit(): void {
    this.dashboardStore.loadDashboardData();
  }
}
