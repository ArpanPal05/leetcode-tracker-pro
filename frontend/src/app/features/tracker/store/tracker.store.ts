import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppEventService } from '../../../core/services/app-event.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserProblemResponse, UserProblemTrackRequest } from '../models/tracker.models';
import { TrackerService } from '../services/tracker.service';

@Injectable({
  providedIn: 'root'
})
export class TrackerStore {
  private trackerService = inject(TrackerService);
  private notificationService = inject(NotificationService);
  private appEventService = inject(AppEventService);
  private router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly success = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly latestTracked = signal<UserProblemResponse | null>(null);

  trackProblem(request: UserProblemTrackRequest): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.trackerService.trackProblemByUrl(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(true);
        this.latestTracked.set(response.data);

        const msg = response.message || 'Problem successfully tracked!';
        this.notificationService.success(msg);
        this.appEventService.notifyProblemChanged();
        this.router.navigate(['/my-problems']);
      },
      error: (err) => {
        this.loading.set(false);
        this.success.set(false);
        const errorMsg =
          err?.error?.detail ||
          err?.error?.message ||
          'Failed to track problem. Please ensure the URL is valid.';
        this.error.set(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    });
  }
}
