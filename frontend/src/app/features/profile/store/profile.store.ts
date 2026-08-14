import { inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { AppEventService } from '../../../core/services/app-event.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserPreferences,
  UserProfile,
  UserStatistics
} from '../models/profile.models';
import { ProfileService } from '../services/profile.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileStore {
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);
  private appEventService = inject(AppEventService);

  readonly profile = signal<UserProfile | null>(null);
  readonly statistics = signal<UserStatistics | null>(null);
  readonly preferences = signal<UserPreferences>({
    theme: 'dark',
    language: 'Python',
    defaultStatus: 'SOLVED',
    notifications: true
  });

  readonly loading = signal<boolean>(false);
  readonly updating = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.appEventService.problemChanged$.subscribe(() => {
      this.loadProfileData();
    });
  }

  loadProfileData(): void {
    this.loading.set(true);
    this.error.set(null);

    const savedPrefs = this.profileService.getPreferences();
    this.preferences.set(savedPrefs);

    forkJoin({
      profile: this.profileService.getProfile().pipe(catchError(() => of(null))),
      statistics: this.profileService.getStatistics().pipe(catchError(() => of(null)))
    }).subscribe({
      next: (res) => {
        this.profile.set(res.profile);
        this.statistics.set(res.statistics);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load profile data.');
        this.notificationService.error('Failed to load profile data.');
      }
    });
  }

  updateProfile(data: UpdateProfileRequest): void {
    this.updating.set(true);
    this.profileService.updateProfile(data).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.updating.set(false);
        this.notificationService.success('Profile updated successfully.');
      },
      error: () => {
        this.updating.set(false);
        this.notificationService.error('Failed to update profile.');
      }
    });
  }

  changePassword(data: ChangePasswordRequest, onSuccess?: () => void): void {
    this.updating.set(true);
    this.profileService.changePassword(data).subscribe({
      next: () => {
        this.updating.set(false);
        this.notificationService.success('Password changed successfully.');
        onSuccess?.();
      },
      error: () => {
        this.updating.set(false);
        this.notificationService.error('Failed to change password.');
      }
    });
  }

  updatePreferences(prefs: UserPreferences): void {
    const updated = this.profileService.savePreferences(prefs);
    this.preferences.set(updated);
    this.notificationService.success('Preferences saved successfully.');
  }

  reset(): void {
    this.profile.set(null);
    this.statistics.set(null);
    this.loading.set(false);
    this.updating.set(false);
    this.error.set(null);
  }
}
