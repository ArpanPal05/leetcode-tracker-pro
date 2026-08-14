import { Routes } from '@angular/router';

export const MY_PROBLEMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/my-problems-list.component').then(
        (m) => m.MyProblemsListComponent
      )
  }
];
