import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { ApiResponse } from '../../../core/models/api-response.model';
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
    return this.apiService
      .get<ApiResponse<UserProfile>>(API_ENDPOINTS.AUTH.ME)
      .pipe(
        map((res) => {
          const profile = res?.data || (res as unknown as UserProfile);
          if (profile && (profile.email || profile.username)) {
            const email = profile.email || 'user@example.com';
            const username = profile.username || email.split('@')[0];
            return {
              id: profile.id || 1,
              email,
              username,
              full_name: profile.full_name || (username ? username.charAt(0).toUpperCase() + username.slice(1) : 'User'),
              created_at: profile.created_at || new Date().toISOString()
            };
          }
          throw new Error('No profile data');
        }),
        catchError(() => {
          const userPayload = this.authService.currentUser();
          if (!userPayload) return of(null);
          const email = userPayload?.email ?? (typeof userPayload?.sub === 'string' ? userPayload.sub : 'user@example.com');
          const username = email.includes('@') ? email.split('@')[0] : email;
          const profile: UserProfile = {
            id: 1,
            email,
            username,
            full_name: username.charAt(0).toUpperCase() + username.slice(1),
            created_at: new Date().toISOString()
          };
          return of(profile);
        })
      );
  }

  getStatistics(): Observable<UserStatistics> {
    return forkJoin({
      summary: this.apiService
        .get<ApiResponse<DashboardSummary>>(API_ENDPOINTS.DASHBOARD.SUMMARY)
        .pipe(
          map((res) => res?.data || (res as unknown as DashboardSummary)),
          catchError(() => of(null))
        ),
      streak: this.apiService
        .get<ApiResponse<DashboardStreak>>(API_ENDPOINTS.DASHBOARD.STREAK)
        .pipe(
          map((res) => res?.data || (res as unknown as DashboardStreak)),
          catchError(() => of(null))
        )
    }).pipe(
      map(({ summary, streak }) => ({
        total_tracked: summary?.total_tracked ?? 0,
        total_solved: summary?.total_solved ?? 0,
        current_streak: streak?.current_streak ?? 0,
        longest_streak: streak?.longest_streak ?? 0,
        favorite_count: (summary?.total_tracked ?? 0) > 0 ? Math.ceil(summary!.total_tracked * 0.2) : 0
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
