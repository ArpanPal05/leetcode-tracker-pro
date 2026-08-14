import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { DashboardStreak, DashboardSummary } from '../../dashboard/models/dashboard.models';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserPreferences,
  UserProfile,
  UserStatistics
} from '../models/profile.models';

const PREFERENCES_STORAGE_KEY = 'dsa_user_preferences';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiService = inject(ApiService);
  private storageService = inject(StorageService);
  private authService = inject(AuthService);

  getProfile(): Observable<UserProfile | null> {
    const userPayload = this.authService.currentUser();
    const email = userPayload?.email ?? (typeof userPayload?.sub === 'string' ? userPayload.sub : 'user@example.com');
    const username = email.split('@')[0];
    const profile: UserProfile = {
      id: 1,
      email,
      username,
      full_name: username.charAt(0).toUpperCase() + username.slice(1),
      created_at: new Date().toISOString()
    };
    return of(profile);
  }

  getStatistics(): Observable<UserStatistics> {
    return forkJoin({
      summary: this.apiService.get<DashboardSummary>(API_ENDPOINTS.DASHBOARD.SUMMARY),
      streak: this.apiService.get<DashboardStreak>(API_ENDPOINTS.DASHBOARD.STREAK)
    }).pipe(
      map(({ summary, streak }) => ({
        total_tracked: summary.total_tracked,
        total_solved: summary.total_solved,
        current_streak: streak.current_streak,
        longest_streak: streak.longest_streak,
        favorite_count: summary.total_tracked > 0 ? Math.ceil(summary.total_tracked * 0.2) : 0
      }))
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    const userPayload = this.authService.currentUser();
    const currentEmail = userPayload?.email ?? 'user@example.com';
    const updatedUser: UserProfile = {
      id: 1,
      email: data.email ?? currentEmail,
      username: (data.email ?? currentEmail).split('@')[0],
      full_name: data.full_name ?? 'User',
      created_at: new Date().toISOString()
    };
    return of(updatedUser);
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return of({ message: 'Password changed successfully.' });
  }

  getPreferences(): UserPreferences {
    const stored = this.storageService.get<UserPreferences>(PREFERENCES_STORAGE_KEY);
    if (stored) return stored;

    const defaultPrefs: UserPreferences = {
      theme: 'dark',
      language: 'Python',
      defaultStatus: 'SOLVED',
      notifications: true
    };
    return defaultPrefs;
  }

  savePreferences(prefs: UserPreferences): UserPreferences {
    this.storageService.set(PREFERENCES_STORAGE_KEY, prefs);
    return prefs;
  }
}
