export interface DashboardSummary {
  total_tracked: number;
  total_solved: number;
  currently_solving: number;
  not_started: number;
  favorites: number;
  needs_revision: number;
  mastered: number;
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface LanguageCount {
  language: string;
  count: number;
}

export interface DashboardDistributions {
  difficulty: DifficultyDistribution;
  languages: LanguageCount[];
}

export interface RecentActivityItem {
  title: string;
  difficulty: string;
  status: string;
  language?: string;
  tracked_at: string;
  solved_at?: string | null;
}

export interface TimeStatistics {
  avg_time_minutes: number;
  min_time_minutes: number;
  max_time_minutes: number;
  total_time_minutes: number;
}

export interface DashboardActivity {
  recent: RecentActivityItem[];
  time_statistics: TimeStatistics;
}

export interface DashboardStreak {
  current_streak: number;
  longest_streak: number;
}

export interface HeatmapItem {
  date: string;
  count: number;
}
