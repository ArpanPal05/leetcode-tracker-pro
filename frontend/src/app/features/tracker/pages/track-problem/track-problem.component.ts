import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TrackFormComponent } from '../../components/track-form/track-form.component';
import { UserProblemTrackRequest } from '../../models/tracker.models';
import { TrackerStore } from '../../store/tracker.store';

@Component({
  selector: 'app-track-problem',
  standalone: true,
  imports: [CommonModule, MatIconModule, TrackFormComponent],
  templateUrl: './track-problem.component.html',
  styleUrl: './track-problem.component.scss'
})
export class TrackProblemComponent {
  readonly trackerStore = inject(TrackerStore);

  onTrackSubmit(request: UserProblemTrackRequest): void {
    this.trackerStore.trackProblem(request);
  }
}
