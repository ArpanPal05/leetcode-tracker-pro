import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
import { ApiService } from '../../../core/services/api.service';
import {
  DashboardActivity,
  DashboardDistributions,
  DashboardStreak,
  DashboardSummary,
  HeatmapItem
} from '../models/analytics.models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiService = inject(ApiService);

  getSummary(): Observable<DashboardSummary> {
    return this.apiService
      .get<ApiResponse<DashboardSummary>>(API_ENDPOINTS.DASHBOARD.SUMMARY)
      .pipe(map((res) => res.data));
  }

  getDistributions(): Observable<DashboardDistributions> {
    return this.apiService
      .get<ApiResponse<DashboardDistributions>>(API_ENDPOINTS.DASHBOARD.DISTRIBUTIONS)
      .pipe(map((res) => res.data));
  }

  getActivity(): Observable<DashboardActivity> {
    return this.apiService
      .get<ApiResponse<DashboardActivity>>(API_ENDPOINTS.DASHBOARD.ACTIVITY)
      .pipe(map((res) => res.data));
  }

  getStreak(): Observable<DashboardStreak> {
    return this.apiService
      .get<ApiResponse<DashboardStreak>>(API_ENDPOINTS.DASHBOARD.STREAK)
      .pipe(map((res) => res.data));
  }

  getHeatmap(): Observable<HeatmapItem[]> {
    return this.apiService
      .get<ApiResponse<HeatmapItem[]>>(API_ENDPOINTS.DASHBOARD.HEATMAP)
      .pipe(map((res) => res.data));
  }
}
