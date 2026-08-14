import { inject, Injectable, signal } from '@angular/core';
import { AppEventService } from '../../../core/services/app-event.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  ProblemStatus,
  UserProblemResponse,
  UserProblemUpdateRequest
} from '../models/my-problems.models';
import { MyProblemsService } from '../services/my-problems.service';

@Injectable({
  providedIn: 'root'
})
export class MyProblemsStore {
  private myProblemsService = inject(MyProblemsService);
  private notificationService = inject(NotificationService);
  private appEventService = inject(AppEventService);

  readonly problems = signal<UserProblemResponse[]>([]);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly size = signal<number>(20);
  readonly pages = signal<number>(1);

  readonly search = signal<string>('');
  readonly statusFilter = signal<ProblemStatus | null>(null);
  readonly languageFilter = signal<string | null>(null);
  readonly favoriteFilter = signal<boolean | null>(null);

  readonly selectedProblem = signal<UserProblemResponse | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.appEventService.problemChanged$.subscribe(() => {
      this.loadProblems();
    });
  }

  loadProblems(): void {
    this.loading.set(true);
    this.error.set(null);

    this.myProblemsService
      .getUserProblems({
        search: this.search(),
        status: this.statusFilter(),
        language: this.languageFilter(),
        favorite: this.favoriteFilter(),
        page: this.page(),
        size: this.size()
      })
      .subscribe({
        next: (res) => {
          this.problems.set(res.items);
          this.total.set(res.total);
          this.page.set(res.page);
          this.size.set(res.size);
          this.pages.set(res.pages);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set('Failed to load tracked problems.');
          this.notificationService.error('Failed to load tracked problems.');
        }
      });
  }

  setSearch(term: string): void {
    this.search.set(term);
    this.page.set(1);
    this.loadProblems();
  }

  setFilters(filters: {
    status?: ProblemStatus | null;
    language?: string | null;
    favorite?: boolean | null;
  }): void {
    if (filters.status !== undefined) this.statusFilter.set(filters.status);
    if (filters.language !== undefined) this.languageFilter.set(filters.language);
    if (filters.favorite !== undefined) this.favoriteFilter.set(filters.favorite);
    this.page.set(1);
    this.loadProblems();
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set(null);
    this.languageFilter.set(null);
    this.favoriteFilter.set(null);
    this.page.set(1);
    this.loadProblems();
  }

  setPage(page: number, size: number): void {
    this.page.set(page);
    this.size.set(size);
    this.loadProblems();
  }

  updateProblem(
    id: number,
    data: UserProblemUpdateRequest,
    onSuccess?: () => void
  ): void {
    this.loading.set(true);
    this.error.set(null);

    this.myProblemsService.updateUserProblem(id, data).subscribe({
      next: (updated) => {
        this.loading.set(false);
        this.problems.update((list) =>
          list.map((item) => (item.id === id ? { ...item, ...updated } : item))
        );
        this.notificationService.success('Problem updated successfully.');
        this.appEventService.notifyProblemChanged();
        onSuccess?.();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.detail || err?.error?.message || 'Failed to update problem.';
        this.error.set(typeof msg === 'string' ? msg : JSON.stringify(msg));
        this.notificationService.error('Failed to update problem.');
      }
    });
  }

  deleteProblem(id: number): void {
    this.loading.set(true);
    this.myProblemsService.deleteUserProblem(id).subscribe({
      next: () => {
        this.notificationService.success('Problem deleted successfully.');
        this.appEventService.notifyProblemChanged();
        this.loadProblems();
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Failed to delete problem.');
      }
    });
  }

  toggleFavorite(id: number): void {
    this.myProblemsService.toggleFavorite(id).subscribe({
      next: (updated) => {
        this.problems.update((list) =>
          list.map((p) => (p.id === id ? { ...p, favorite: updated.favorite } : p))
        );
        this.notificationService.success(
          updated.favorite ? 'Added to favorites.' : 'Removed from favorites.'
        );
        this.appEventService.notifyProblemChanged();
      },
      error: () => {
        this.notificationService.error('Failed to update favorite status.');
      }
    });
  }

  reset(): void {
    this.problems.set([]);
    this.total.set(0);
    this.page.set(1);
    this.size.set(20);
    this.search.set('');
    this.statusFilter.set(null);
    this.languageFilter.set(null);
    this.favoriteFilter.set(null);
    this.selectedProblem.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}
