import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { DeleteDialogComponent } from '../../components/delete-dialog/delete-dialog.component';
import { DetailsDialogComponent } from '../../components/details-dialog/details-dialog.component';
import { EditProblemDialogComponent } from '../../components/edit-problem-dialog/edit-problem-dialog.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { LoadingStateComponent } from '../../components/loading-state/loading-state.component';
import { ProblemCardComponent } from '../../components/problem-card/problem-card.component';
import { ProblemTableComponent } from '../../components/problem-table/problem-table.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { ProblemStatus, UserProblemResponse } from '../../models/my-problems.models';
import { MyProblemsStore } from '../../store/my-problems.store';

@Component({
  selector: 'app-my-problems-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatDialogModule,
    SearchBarComponent,
    FilterPanelComponent,
    ProblemTableComponent,
    ProblemCardComponent,
    EmptyStateComponent,
    LoadingStateComponent
  ],
  templateUrl: './my-problems-list.component.html',
  styleUrl: './my-problems-list.component.scss'
})
export class MyProblemsListComponent implements OnInit {
  readonly myProblemsStore = inject(MyProblemsStore);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.myProblemsStore.loadProblems();
  }

  onSearchChange(term: string): void {
    this.myProblemsStore.setSearch(term);
  }

  onFilterChange(filters: {
    status?: ProblemStatus | null;
    language?: string | null;
    favorite?: boolean | null;
  }): void {
    this.myProblemsStore.setFilters(filters);
  }

  onClearFilters(): void {
    this.myProblemsStore.clearFilters();
  }

  onPageChange(event: PageEvent): void {
    this.myProblemsStore.setPage(event.pageIndex + 1, event.pageSize);
  }

  onViewDetails(problem: UserProblemResponse): void {
    this.dialog.open(DetailsDialogComponent, {
      data: problem,
      width: '600px'
    });
  }

  onEditProblem(problem: UserProblemResponse): void {
    this.dialog.open(EditProblemDialogComponent, {
      data: problem,
      width: '600px'
    });
  }

  onDeleteProblem(problem: UserProblemResponse): void {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        title: problem.problem?.title || 'Unknown Problem',
        difficulty: problem.problem?.difficulty,
        status: problem.status
      },
      width: '460px'
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.myProblemsStore.deleteProblem(problem.id);
      }
    });
  }

  onToggleFavorite(id: number): void {
    this.myProblemsStore.toggleFavorite(id);
  }
}
