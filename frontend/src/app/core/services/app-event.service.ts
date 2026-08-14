import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppEventService {
  private readonly problemChangedSubject = new Subject<void>();

  /**
   * Observable stream emitted when any problem is tracked, updated, or deleted.
   */
  readonly problemChanged$ = this.problemChangedSubject.asObservable();

  /**
   * Notify dependent stores (Dashboard, Analytics, Profile, My Problems) that problem data changed.
   */
  notifyProblemChanged(): void {
    this.problemChangedSubject.next();
  }
}
