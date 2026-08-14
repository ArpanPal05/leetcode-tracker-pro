import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { UserProblemResponse } from '../../models/my-problems.models';

@Component({
  selector: 'app-problem-table',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-card class="table-card">
      <div class="table-responsive">
        <table mat-table [dataSource]="problems" class="full-width">
          <!-- Favorite Column -->
          <ng-container matColumnDef="favorite">
            <th mat-header-cell *matHeaderCellDef>★</th>
            <td mat-cell *matCellDef="let element">
              <mat-icon
                class="star-icon"
                [class.active]="element.favorite"
                (click)="toggleFavorite.emit(element.id)"
              >
                {{ element.favorite ? 'star' : 'star_border' }}
              </mat-icon>
            </td>
          </ng-container>

          <!-- Title Column -->
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Problem Title</th>
            <td mat-cell *matCellDef="let element" class="problem-title">
              {{ element.problem?.title || 'Unknown Problem' }}
            </td>
          </ng-container>

          <!-- Difficulty Column -->
          <ng-container matColumnDef="difficulty">
            <th mat-header-cell *matHeaderCellDef>Difficulty</th>
            <td mat-cell *matCellDef="let element">
              <span
                class="chip-difficulty"
                [ngClass]="(element.problem?.difficulty || '').toLowerCase()"
              >
                {{ element.problem?.difficulty || 'N/A' }}
              </span>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let element">
              <span class="badge-status" [ngClass]="element.status.toLowerCase()">
                {{ element.status }}
              </span>
            </td>
          </ng-container>

          <!-- Language Column -->
          <ng-container matColumnDef="language">
            <th mat-header-cell *matHeaderCellDef>Language</th>
            <td mat-cell *matCellDef="let element">
              {{ element.language || 'N/A' }}
            </td>
          </ng-container>

          <!-- Tracked Date Column -->
          <ng-container matColumnDef="tracked_at">
            <th mat-header-cell *matHeaderCellDef>Tracked Date</th>
            <td mat-cell *matCellDef="let element">
              {{ element.created_at | date: 'mediumDate' }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let element">
              <div class="action-buttons">
                <button
                  mat-icon-button
                  type="button"
                  color="primary"
                  (click)="viewDetails.emit(element)"
                  title="View Details"
                >
                  <mat-icon>visibility</mat-icon>
                </button>
                <button
                  mat-icon-button
                  type="button"
                  color="accent"
                  (click)="editProblem.emit(element)"
                  title="Edit Problem"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  type="button"
                  color="warn"
                  (click)="deleteProblem.emit(element)"
                  title="Delete Problem"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </div>
    </mat-card>
  `,
  styleUrl: './problem-table.component.scss'
})
export class ProblemTableComponent {
  @Input() problems: UserProblemResponse[] = [];

  @Output() viewDetails = new EventEmitter<UserProblemResponse>();
  @Output() editProblem = new EventEmitter<UserProblemResponse>();
  @Output() deleteProblem = new EventEmitter<UserProblemResponse>();
  @Output() toggleFavorite = new EventEmitter<number>();

  displayedColumns = [
    'favorite',
    'title',
    'difficulty',
    'status',
    'language',
    'tracked_at',
    'actions'
  ];
}
