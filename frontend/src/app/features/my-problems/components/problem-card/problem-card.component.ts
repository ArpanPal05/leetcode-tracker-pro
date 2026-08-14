import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserProblemResponse } from '../../models/my-problems.models';

@Component({
  selector: 'app-problem-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="card-grid">
      <mat-card *ngFor="let item of problems" class="mobile-card">
        <div class="card-header-row">
          <span class="card-title">{{ item.problem?.title || 'Unknown Problem' }}</span>
          <mat-icon
            class="star-icon"
            [class.active]="item.favorite"
            (click)="toggleFavorite.emit(item.id)"
          >
            {{ item.favorite ? 'star' : 'star_border' }}
          </mat-icon>
        </div>

        <div class="card-meta-row">
          <span class="chip-difficulty" [ngClass]="(item.problem?.difficulty || '').toLowerCase()">
            {{ item.problem?.difficulty || 'N/A' }}
          </span>
          <span class="badge-status" [ngClass]="item.status.toLowerCase()">
            {{ item.status }}
          </span>
        </div>

        <div class="card-footer-row">
          <span>Language: {{ item.language || 'N/A' }}</span>
          <div class="action-btns">
            <button mat-icon-button color="primary" (click)="viewDetails.emit(item)" title="View Details">
              <mat-icon>visibility</mat-icon>
            </button>
            <button mat-icon-button color="accent" (click)="editProblem.emit(item)" title="Edit Problem">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteProblem.emit(item)" title="Delete Problem">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styleUrl: './problem-card.component.scss'
})
export class ProblemCardComponent {
  @Input() problems: UserProblemResponse[] = [];

  @Output() viewDetails = new EventEmitter<UserProblemResponse>();
  @Output() editProblem = new EventEmitter<UserProblemResponse>();
  @Output() deleteProblem = new EventEmitter<UserProblemResponse>();
  @Output() toggleFavorite = new EventEmitter<number>();
}
