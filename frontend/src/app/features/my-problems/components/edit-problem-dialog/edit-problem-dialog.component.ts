import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProblemStatus, UserProblemResponse, UserProblemUpdateRequest } from '../../models/my-problems.models';
import { MyProblemsStore } from '../../store/my-problems.store';

@Component({
  selector: 'app-edit-problem-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="edit-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>Edit Tracked Problem</h2>
        <button mat-icon-button type="button" (click)="onCancel()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="problem-meta-banner">
        <span class="meta-title">{{ data.problem?.title || 'Unknown Problem' }}</span>
        <span class="chip-difficulty" [ngClass]="(data.problem?.difficulty || '').toLowerCase()">
          {{ data.problem?.difficulty || 'N/A' }}
        </span>
      </div>

      <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="edit-form">
        <mat-dialog-content>
          <!-- Status & Language Row -->
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Status *</mat-label>
              <mat-select formControlName="status">
                <mat-option *ngFor="let opt of statusOptions" [value]="opt.value">
                  {{ opt.label }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="editForm.get('status')?.hasError('required')">
                Status is required.
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Language</mat-label>
              <mat-select formControlName="language">
                <mat-option *ngFor="let lang of languageOptions" [value]="lang">
                  {{ lang }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Time Taken & Solution URL Row -->
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Time Taken (Minutes)</mat-label>
              <input
                matInput
                type="number"
                min="0"
                formControlName="time_taken_minutes"
                placeholder="e.g. 30"
              />
              <mat-icon matSuffix>timer</mat-icon>
              <mat-error *ngIf="editForm.get('time_taken_minutes')?.hasError('min')">
                Time taken must be a non-negative number.
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Solution URL</mat-label>
              <input
                matInput
                type="url"
                formControlName="solution_url"
                placeholder="https://github.com/..."
              />
              <mat-icon matSuffix>code</mat-icon>
              <mat-error *ngIf="editForm.get('solution_url')?.hasError('pattern')">
                Please enter a valid URL.
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Favorite Toggle -->
          <div class="favorite-toggle-container">
            <mat-slide-toggle formControlName="favorite" color="primary">
              Mark as Favorite ★
            </mat-slide-toggle>
          </div>

          <!-- Notes -->
          <mat-form-field appearance="outline" class="full-width" style="margin-top: 0.75rem;">
            <mat-label>Notes & Insights</mat-label>
            <textarea
              matInput
              rows="4"
              formControlName="notes"
              placeholder="Update space/time complexity notes or key intuition..."
            ></textarea>
            <mat-error *ngIf="editForm.get('notes')?.hasError('maxlength')">
              Notes cannot exceed 5000 characters.
            </mat-error>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()" [disabled]="myProblemsStore.loading()">
            Cancel
          </button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="editForm.invalid || myProblemsStore.loading()"
          >
            <div class="button-content">
              <mat-spinner *ngIf="myProblemsStore.loading()" diameter="18" color="accent"></mat-spinner>
              <span>{{ myProblemsStore.loading() ? 'Saving...' : 'Save Changes' }}</span>
            </div>
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styleUrl: './edit-problem-dialog.component.scss'
})
export class EditProblemDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly myProblemsStore = inject(MyProblemsStore);

  readonly statusOptions = [
    { label: 'Not Started', value: ProblemStatus.NOT_STARTED },
    { label: 'Attempting', value: ProblemStatus.ATTEMPTING },
    { label: 'Solved', value: ProblemStatus.SOLVED },
    { label: 'Needs Revision', value: ProblemStatus.NEEDS_REVISION },
    { label: 'Mastered', value: ProblemStatus.MASTERED }
  ];

  readonly languageOptions = [
    'Python',
    'Java',
    'C++',
    'JavaScript',
    'TypeScript',
    'Go',
    'Rust',
    'C#',
    'SQL'
  ];

  editForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditProblemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserProblemResponse
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      status: [this.data.status, [Validators.required]],
      language: [this.data.language || 'Python'],
      time_taken_minutes: [this.data.time_taken_minutes ?? null, [Validators.min(0)]],
      favorite: [Boolean(this.data.favorite)],
      solution_url: [this.data.solution_url || '', [Validators.pattern('https?://.+')]],
      notes: [this.data.notes || '', [Validators.maxLength(5000)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const val = this.editForm.value;
    const request: UserProblemUpdateRequest = {
      status: val.status,
      language: val.language || null,
      time_taken_minutes: val.time_taken_minutes !== null ? Number(val.time_taken_minutes) : null,
      favorite: Boolean(val.favorite),
      solution_url: val.solution_url ? val.solution_url.trim() : null,
      notes: val.notes ? val.notes.trim() : null
    };

    this.myProblemsStore.updateProblem(this.data.id, request, () => {
      this.dialogRef.close(true);
    });
  }
}
