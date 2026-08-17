import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteDialogData {
  title: string;
  difficulty?: string;
  status?: string;
}

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="delete-dialog-tile">
      <div class="dialog-header">
        <div class="icon-ring danger">
          <mat-icon>delete_forever</mat-icon>
        </div>
        <div class="header-text">
          <h2 mat-dialog-title>Delete Tracked Problem</h2>
          <p class="subtitle">Confirm removal from your DSA tracker</p>
        </div>
        <button mat-icon-button type="button" class="close-btn" (click)="onCancel()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="dialog-content">
        <div class="target-problem-card">
          <mat-icon class="problem-icon">assignment_late</mat-icon>
          <div class="problem-details">
            <span class="problem-name">{{ data.title }}</span>
            <div class="badges" *ngIf="data.difficulty || data.status">
              <span *ngIf="data.difficulty" class="chip-difficulty" [ngClass]="data.difficulty.toLowerCase()">
                {{ data.difficulty }}
              </span>
              <span *ngIf="data.status" class="badge-status" [ngClass]="data.status.toLowerCase()">
                {{ data.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="warning-callout">
          <mat-icon class="warn-icon">warning_amber</mat-icon>
          <span>This action cannot be undone. This problem and its recorded notes will be permanently removed.</span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button type="button" class="cancel-btn" (click)="onCancel()">
          Cancel
        </button>
        <button mat-raised-button color="warn" type="button" class="delete-confirm-btn" (click)="onConfirm()">
          <mat-icon>delete</mat-icon>
          <span>Delete Problem</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-dialog-tile {
      padding: 1.5rem;
      background: var(--color-surface);
      border-radius: 16px;
      color: var(--color-text-primary);
    }

    .dialog-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      position: relative;
      margin-bottom: 1.25rem;

      .icon-ring {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        flex-shrink: 0;

        mat-icon {
          font-size: 1.5rem;
          width: 1.5rem;
          height: 1.5rem;
        }

        &.danger {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
      }

      .header-text {
        h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: var(--color-text-primary);
          line-height: 1.3;
        }

        .subtitle {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
          margin: 0.2rem 0 0 0;
        }
      }

      .close-btn {
        position: absolute;
        top: -0.25rem;
        right: -0.25rem;
        color: var(--color-text-muted);

        &:hover {
          color: var(--color-text-primary);
        }
      }
    }

    .dialog-content {
      padding: 0 !important;
      margin-bottom: 1.5rem;
    }

    .target-problem-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      margin-bottom: 1rem;

      .problem-icon {
        color: #ef4444;
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }

      .problem-details {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        .problem-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      }
    }

    .chip-difficulty {
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;

      &.easy { background: rgba(16, 185, 129, 0.15); color: #10b981; }
      &.medium { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
      &.hard { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    }

    .badge-status {
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
      background: #334155;
      color: #94a3b8;

      &.solved, &.mastered { background: rgba(16, 185, 129, 0.15); color: #10b981; }
      &.attempting { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    }

    .warning-callout {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      padding: 0.75rem 0.9rem;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 10px;
      font-size: 0.8125rem;
      color: #f59e0b;
      line-height: 1.45;

      .warn-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
        flex-shrink: 0;
        margin-top: 0.1rem;
      }
    }

    .dialog-actions {
      padding: 0 !important;
      gap: 0.75rem;

      .cancel-btn {
        border-color: var(--color-border);
        color: var(--color-text-secondary);
        border-radius: 8px;
      }

      .delete-confirm-btn {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        color: #ffffff !important;
        font-weight: 700;
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;

        mat-icon {
          font-size: 1.1rem;
          width: 1.1rem;
          height: 1.1rem;
        }
      }
    }
  `]
})
export class DeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
