import { Routes } from '@angular/router';

export const TRACKER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/track-problem/track-problem.component').then(
        (m) => m.TrackProblemComponent
      )
  }
];
