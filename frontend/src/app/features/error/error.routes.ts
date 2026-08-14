import { Routes } from '@angular/router';

export const ERROR_ROUTES: Routes = [
  {
    path: '404',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent)
  },
  {
    path: '500',
    loadComponent: () =>
      import('./pages/server-error/server-error.component').then((m) => m.ServerErrorComponent)
  },
  {
    path: '403',
    loadComponent: () =>
      import('./pages/access-denied/access-denied.component').then((m) => m.AccessDeniedComponent)
  }
];
