import {
  DashboardActivity,
  DashboardDistributions,
  DashboardStreak,
  DashboardSummary,
  HeatmapItem
} from '../../dashboard/models/dashboard.models';

export interface MonthlyProgressItem {
  month: string;
  count: number;
}

export interface WeeklyProgressItem {
  week: string;
  count: number;
}

export interface TopicDistributionItem {
  topic: string;
  count: number;
}

export type {
  DashboardActivity,
  DashboardDistributions,
  DashboardStreak,
  DashboardSummary,
  HeatmapItem
};
