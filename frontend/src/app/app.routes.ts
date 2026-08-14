import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/error/pages/not-found/not-found.component').then((m) => m.NotFoundComponent)
  },
  {
    path: '500',
    loadComponent: () =>
      import('./features/error/pages/server-error/server-error.component').then((m) => m.ServerErrorComponent)
  },
  {
    path: '403',
    loadComponent: () =>
      import('./features/error/pages/access-denied/access-denied.component').then((m) => m.AccessDeniedComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'tracker',
        loadComponent: () =>
          import('./features/tracker/pages/track-problem/track-problem.component').then((m) => m.TrackProblemComponent)
      },
      {
        path: 'my-problems',
        loadComponent: () =>
          import('./features/my-problems/pages/list/my-problems-list.component').then((m) => m.MyProblemsListComponent)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/pages/analytics/analytics.component').then((m) => m.AnalyticsComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile/profile.component').then((m) => m.ProfileComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
