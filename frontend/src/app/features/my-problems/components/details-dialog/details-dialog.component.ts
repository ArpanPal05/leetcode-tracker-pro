import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProblemStatus, UserProblemResponse } from '../../models/my-problems.models';

@Component({
  selector: 'app-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="details-dialog">
      <!-- Header -->
      <div class="details-header">
        <div class="header-left">
          <h2 mat-dialog-title class="dialog-title">
            {{ data.problem?.title || 'Problem Details' }}
          </h2>
          <span *ngIf="data.favorite" class="favorite-badge" title="Favorited">
            <mat-icon class="star-icon">star</mat-icon>
            <span>Favorite</span>
          </span>
        </div>
        <a
          *ngIf="problemUrl"
          [href]="problemUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="platform-link-btn"
        >
          <span>Open {{ data.problem?.platform || 'Problem' }}</span>
          <mat-icon>open_in_new</mat-icon>
        </a>
      </div>

      <mat-dialog-content class="details-content">
        <!-- Problem Details Section -->
        <div class="section-container">
          <div class="section-title">Problem Details</div>
          <div class="info-grid">
            <!-- Platform -->
            <div class="info-item">
              <span class="label">Platform</span>
              <span class="val platform-val">{{ data.problem?.platform || 'LeetCode' }}</span>
            </div>

            <!-- Difficulty -->
            <div class="info-item">
              <span class="label">Difficulty</span>
              <span class="chip-difficulty" [ngClass]="difficultyClass">
                {{ formattedDifficulty }}
              </span>
            </div>

            <!-- Status -->
            <div class="info-item">
              <span class="label">Status</span>
              <span class="badge-status" [ngClass]="statusClass">
                {{ formattedStatus }}
              </span>
            </div>

            <!-- Language (only if available) -->
            <div *ngIf="data.language" class="info-item">
              <span class="label">Language</span>
              <span class="val">{{ data.language }}</span>
            </div>

            <!-- Time Taken (only if available) -->
            <div *ngIf="data.time_taken_minutes != null" class="info-item">
              <span class="label">Time Taken</span>
              <span class="val">{{ data.time_taken_minutes }} mins</span>
            </div>

            <!-- Solved Date (only if available) -->
            <div *ngIf="data.solved_at" class="info-item">
              <span class="label">Solved Date</span>
              <span class="val">{{ data.solved_at | date: 'MMM d, y, h:mm a' }}</span>
            </div>
          </div>
        </div>

        <!-- Solution Section (only if available) -->
        <div *ngIf="data.solution_url" class="section-container">
          <div class="section-title">Solution</div>
          <div class="solution-box">
            <a
              [href]="data.solution_url"
              target="_blank"
              rel="noopener noreferrer"
              class="solution-btn"
            >
              <mat-icon>code</mat-icon>
              <span>View Solution</span>
              <mat-icon class="external-icon">open_in_new</mat-icon>
            </a>
          </div>
        </div>

        <!-- Notes & Insights Section -->
        <div class="section-container">
          <div class="section-title">Notes & Insights</div>
          <div class="notes-body">
            {{ displayNotes }}
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button (click)="onClose()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .details-dialog {
      min-width: 480px;
      max-width: 650px;
      color: var(--color-text-primary);

      @media (max-width: 600px) {
        min-width: 100%;
      }
    }

    .details-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.5rem 0.75rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
      padding: 0;
    }

    .favorite-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      background: rgba(234, 179, 8, 0.15);
      color: #eab308;

      .star-icon {
        font-size: 0.95rem;
        width: 0.95rem;
        height: 0.95rem;
      }
    }

    .platform-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      background-color: var(--color-surface-hover);
      border: 1px solid var(--color-border);
      transition: background-color 0.2s ease, color 0.2s ease;

      &:hover {
        background-color: var(--color-primary);
        color: #ffffff;
      }

      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
      }
    }

    .details-content {
      padding: 1.25rem 1.5rem !important;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .section-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .section-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.875rem 1.25rem;
      background-color: var(--color-surface-hover);
      border: 1px solid var(--color-border);
      padding: 1rem 1.25rem;
      border-radius: 8px;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .label {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        font-weight: 500;
      }

      .val {
        color: var(--color-text-primary);
        font-weight: 600;
        font-size: 0.9375rem;
      }

      .platform-val {
        color: var(--color-text-primary);
      }
    }

    .chip-difficulty {
      display: inline-block;
      width: fit-content;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      &.easy { background: rgba(16, 185, 129, 0.15); color: #10b981; }
      &.medium { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
      &.hard { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    }

    .badge-status {
      display: inline-block;
      width: fit-content;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: var(--color-border);
      color: var(--color-text-secondary);
      &.solved, &.mastered { background: rgba(16, 185, 129, 0.15); color: #10b981; }
      &.in-progress, &.attempting { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
      &.needs-revision { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
      &.not-started { background: rgba(100, 116, 139, 0.15); color: #64748b; }
    }

    .solution-box {
      background-color: var(--color-surface-hover);
      border: 1px solid var(--color-border);
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }

    .solution-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.25);
      transition: background-color 0.2s ease, border-color 0.2s ease;

      &:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: var(--color-primary);
      }

      mat-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
      }

      .external-icon {
        font-size: 0.9rem;
        width: 0.9rem;
        height: 0.9rem;
        margin-left: 0.1rem;
      }
    }

    .notes-body {
      background-color: var(--color-surface-hover);
      border: 1px solid var(--color-border);
      padding: 1rem 1.25rem;
      border-radius: 8px;
      color: var(--color-text-primary);
      font-size: 0.875rem;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .dialog-actions {
      padding: 0.75rem 1.5rem 1.25rem 1.5rem !important;
      border-top: 1px solid var(--color-border);
    }
  `]
})
export class DetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserProblemResponse
  ) {}

  get formattedDifficulty(): string {
    const diff = this.data.problem?.difficulty || '';
    switch (diff.toUpperCase()) {
      case 'EASY':
        return 'Easy';
      case 'MEDIUM':
        return 'Medium';
      case 'HARD':
        return 'Hard';
      default:
        return diff ? diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase() : 'Medium';
    }
  }

  get difficultyClass(): string {
    return (this.data.problem?.difficulty || 'medium').toLowerCase();
  }

  get formattedStatus(): string {
    const s: string = String(this.data.status || '');
    switch (s) {
      case ProblemStatus.NOT_STARTED:
      case 'NOT_STARTED':
        return 'Not Started';
      case ProblemStatus.ATTEMPTING:
      case 'ATTEMPTING':
      case 'IN_PROGRESS':
        return 'In Progress';
      case ProblemStatus.SOLVED:
      case 'SOLVED':
        return 'Solved';
      case ProblemStatus.NEEDS_REVISION:
      case 'NEEDS_REVISION':
        return 'Needs Revision';
      case ProblemStatus.MASTERED:
      case 'MASTERED':
        return 'Mastered';
      default:
        return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
    }
  }

  get statusClass(): string {
    const s = (this.data.status || '').toLowerCase().replace(/_/g, '-');
    return s;
  }

  get displayNotes(): string {
    if (!this.data.notes) {
      return 'No notes added for this problem.';
    }
    // Return clean plain text without literal markdown bold formatting markers if present
    return this.data.notes.replace(/\*\*(.*?)\*\*/g, '$1').trim();
  }

  get problemUrl(): string | null {
    const prob = this.data.problem;
    if (!prob) return null;

    if (prob.leetcode_url) {
      return prob.leetcode_url;
    }

    const platform = (prob.platform || '').toLowerCase();
    if (platform === 'leetcode' && (prob.slug || prob.title_slug)) {
      return `https://leetcode.com/problems/${prob.slug || prob.title_slug}/`;
    }
    if (platform === 'codeforces' && prob.external_id) {
      return `https://codeforces.com/problemset/problem/${prob.external_id}`;
    }
    if (platform === 'codechef' && prob.external_id) {
      return `https://www.codechef.com/problems/${prob.external_id}`;
    }

    return null;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
