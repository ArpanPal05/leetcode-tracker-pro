import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UserProblemResponse } from '../../models/my-problems.models';

@Component({
  selector: 'app-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="details-dialog">
      <div class="details-header">
        <h2 mat-dialog-title>{{ data.problem?.title || 'Problem Details' }}</h2>
        <a
          *ngIf="data.problem?.leetcode_url"
          [href]="data.problem?.leetcode_url"
          target="_blank"
          rel="noopener noreferrer"
          class="leetcode-link-btn"
        >
          <span>Open LeetCode</span>
          <mat-icon>open_in_new</mat-icon>
        </a>
      </div>

      <mat-dialog-content class="details-content">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Difficulty:</span>
            <span class="chip-difficulty" [ngClass]="(data.problem?.difficulty || '').toLowerCase()">
              {{ data.problem?.difficulty || 'N/A' }}
            </span>
          </div>

          <div class="info-item">
            <span class="label">Status:</span>
            <span class="badge-status" [ngClass]="data.status.toLowerCase()">
              {{ data.status }}
            </span>
          </div>

          <div class="info-item">
            <span class="label">Language:</span>
            <span class="val">{{ data.language || 'N/A' }}</span>
          </div>

          <div class="info-item">
            <span class="label">Time Taken:</span>
            <span class="val">{{ data.time_taken_minutes ? data.time_taken_minutes + ' mins' : 'N/A' }}</span>
          </div>

          <div class="info-item">
            <span class="label">Tracked Date:</span>
            <span class="val">{{ data.created_at | date: 'medium' }}</span>
          </div>

          <div class="info-item">
            <span class="label">Solved Date:</span>
            <span class="val">{{ data.solved_at ? (data.solved_at | date: 'medium') : 'Not solved yet' }}</span>
          </div>
        </div>

        <div *ngIf="data.solution_url" class="solution-link-section">
          <span class="label">Solution Repository / Link:</span>
          <a [href]="data.solution_url" target="_blank" class="solution-link">
            {{ data.solution_url }}
          </a>
        </div>

        <div class="notes-section">
          <span class="label">Notes & Insights:</span>
          <div class="notes-body">
            {{ data.notes || 'No notes added for this problem.' }}
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .details-dialog {
      min-width: 500px;
      max-width: 650px;

      @media (max-width: 600px) {
        min-width: 100%;
      }
    }
    .details-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 1.5rem;
    }
    .leetcode-link-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #3b82f6;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
      background-color: var(--color-surface-hover);
      padding: 1rem;
      border-radius: 8px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .label {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        text-transform: uppercase;

        .val {
          color: var(--color-text-primary);
          font-weight: 600;
        }
      }
    }
    .chip-difficulty {
      display: inline-block;
      width: fit-content;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      &.easy { background: rgba(16,185,129,0.15); color: #10b981; }
      &.medium { background: rgba(245,158,11,0.15); color: #f59e0b; }
      &.hard { background: rgba(239,68,68,0.15); color: #ef4444; }
    }
    .badge-status {
      display: inline-block;
      width: fit-content;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: var(--color-border);
      color: var(--color-text-secondary);
      &.solved, &.mastered { background: rgba(16,185,129,0.15); color: #10b981; }
      &.solving, &.attempting { background: rgba(59,130,246,0.15); color: #3b82f6; }
    }
    .solution-link-section {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .label {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
      }
      .solution-link {
        color: #3b82f6;
        word-break: break-all;
      }
    }
    .notes-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .label {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        text-transform: uppercase;
      }
      .notes-body {
        background-color: var(--color-surface-hover);
        padding: 1rem;
        border-radius: 8px;
        color: var(--color-text-primary);
        font-size: 0.875rem;
        white-space: pre-wrap;
      }
    }
  `]
})
export class DetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserProblemResponse
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
