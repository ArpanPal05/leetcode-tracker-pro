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

export interface StatusOption {
  label: string;
  value: ProblemStatus;
  icon: string;
  colorClass: string;
}

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
      <!-- Header Matching View Tile -->
      <div class="details-header">
        <div class="header-left">
          <h2 mat-dialog-title class="dialog-title">
            Edit {{ data.problem?.title || 'Tracked Problem' }}
          </h2>
          <span *ngIf="isFavorite" class="favorite-badge" title="Favorited">
            <mat-icon class="star-icon">star</mat-icon>
            <span>Favorite</span>
          </span>
        </div>
        <button mat-icon-button type="button" class="close-btn" (click)="onCancel()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="edit-form">
        <mat-dialog-content class="details-content">
          <!-- Section 1: Problem Overview Banner -->
          <div class="section-container">
            <div class="section-title">Problem Metadata</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Platform</span>
                <span class="val">{{ data.problem?.platform || 'LeetCode' }}</span>
              </div>

              <div class="info-item">
                <span class="label">Difficulty</span>
                <span class="chip-difficulty" [ngClass]="difficultyClass">
                  {{ formattedDifficulty }}
                </span>
              </div>

              <div class="info-item">
                <span class="label">Tracked Date</span>
                <span class="val">{{ data.created_at | date: 'MMM d, y' }}</span>
              </div>

              <div class="info-item" *ngIf="data.solved_at">
                <span class="label">Solved Date</span>
                <span class="val">{{ data.solved_at | date: 'MMM d, y' }}</span>
              </div>
            </div>
          </div>

          <!-- Section 2: Status & Language -->
          <div class="section-container">
            <div class="section-title">Status & Language</div>
            <div class="form-row">
              <mat-form-field appearance="outline" floatLabel="always" class="form-field full-width">
                <mat-label>Status *</mat-label>
                <mat-select formControlName="status">
                  <mat-select-trigger>
                    <div class="status-trigger-content" *ngIf="selectedStatusOption as opt">
                      <mat-icon class="trigger-icon" [ngClass]="opt.colorClass" [fontIcon]="opt.icon"></mat-icon>
                      <span>{{ opt.label }}</span>
                    </div>
                  </mat-select-trigger>
                  <mat-option *ngFor="let opt of statusOptions" [value]="opt.value">
                    <div class="status-option-item">
                      <mat-icon class="option-icon" [ngClass]="opt.colorClass" [fontIcon]="opt.icon"></mat-icon>
                      <span>{{ opt.label }}</span>
                    </div>
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="editForm.get('status')?.hasError('required')">
                  Status is required.
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" floatLabel="always" class="form-field full-width">
                <mat-label>Language</mat-label>
                <mat-icon matPrefix class="field-icon">code</mat-icon>
                <mat-select formControlName="language">
                  <mat-option *ngFor="let lang of languageOptions" [value]="lang">
                    {{ lang }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Section 3: Solve Duration & Solution URL -->
          <div class="section-container">
            <div class="section-title">Solve Duration & Solution URL</div>
            <div class="form-row">
              <div class="input-with-presets">
                <mat-form-field appearance="outline" floatLabel="always" class="form-field full-width">
                  <mat-label>Time Taken (Minutes)</mat-label>
                  <mat-icon matPrefix class="field-icon">timer</mat-icon>
                  <input
                    matInput
                    type="number"
                    min="0"
                    formControlName="time_taken_minutes"
                    placeholder="e.g. 25"
                  />
                  <mat-error *ngIf="editForm.get('time_taken_minutes')?.hasError('min')">
                    Time taken must be non-negative.
                  </mat-error>
                </mat-form-field>

                <div class="preset-chips">
                  <span class="preset-label">Quick set:</span>
                  <button
                    *ngFor="let preset of quickTimePresets"
                    type="button"
                    class="preset-chip"
                    [class.active]="editForm.get('time_taken_minutes')?.value === preset"
                    (click)="setTimePreset(preset)"
                  >
                    {{ preset }}m
                  </button>
                </div>
              </div>

              <div class="input-column">
                <mat-form-field appearance="outline" floatLabel="always" class="form-field full-width">
                  <mat-label>Solution GitHub / Repo URL</mat-label>
                  <mat-icon matPrefix class="field-icon">terminal</mat-icon>
                  <input
                    matInput
                    type="url"
                    formControlName="solution_url"
                    placeholder="https://github.com/..."
                  />
                  <mat-error *ngIf="editForm.get('solution_url')?.hasError('pattern')">
                    Must start with http:// or https://.
                  </mat-error>
                </mat-form-field>
              </div>
            </div>
          </div>

          <!-- Section 4: Favorite Bookmark -->
          <div class="section-container">
            <div class="section-title">Favorite Bookmark</div>
            <div
              class="favorite-card"
              [class.is-favorite]="isFavorite"
              (click)="toggleFavorite()"
              role="button"
              tabindex="0"
            >
              <div class="favorite-info">
                <div class="star-wrapper">
                  <mat-icon class="fav-star-icon" [fontIcon]="isFavorite ? 'star' : 'star_border'"></mat-icon>
                </div>
                <div class="fav-text">
                  <span class="fav-title">Bookmark as Favorite</span>
                  <span class="fav-subtitle">Pin this problem for quick access and revision</span>
                </div>
              </div>
              <div class="fav-status-chip" [class.active]="isFavorite">
                <mat-icon class="chip-star">{{ isFavorite ? 'star' : 'star_border' }}</mat-icon>
                <span>{{ isFavorite ? 'Favorited' : 'Not Favorited' }}</span>
              </div>
            </div>
          </div>

          <!-- Section 5: Notes & Insights -->
          <div class="section-container">
            <div class="section-title">Notes & Insights</div>
            <mat-form-field appearance="outline" floatLabel="always" class="form-field full-width notes-field">
              <mat-label>Personal Notes</mat-label>
              <textarea
                matInput
                rows="4"
                formControlName="notes"
                placeholder="Write intuition, time/space complexity O(N), or key takeaways..."
              ></textarea>
              <mat-hint align="end">{{ (editForm.get('notes')?.value || '').length }} / 5000</mat-hint>
              <mat-error *ngIf="editForm.get('notes')?.hasError('maxlength')">
                Notes cannot exceed 5000 characters.
              </mat-error>
            </mat-form-field>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="dialog-actions">
          <button mat-button type="button" class="cancel-btn" (click)="onCancel()" [disabled]="myProblemsStore.loading()">
            Cancel
          </button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            class="save-btn"
            [disabled]="editForm.invalid || myProblemsStore.loading()"
          >
            <div class="button-content">
              <mat-spinner *ngIf="myProblemsStore.loading()" diameter="18" color="accent"></mat-spinner>
              <mat-icon *ngIf="!myProblemsStore.loading()">save</mat-icon>
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

  readonly statusOptions: StatusOption[] = [
    { label: 'Not Started', value: ProblemStatus.NOT_STARTED, icon: 'hourglass_empty', colorClass: 'status-not-started' },
    { label: 'In Progress / Attempting', value: ProblemStatus.ATTEMPTING, icon: 'timelapse', colorClass: 'status-attempting' },
    { label: 'Solved', value: ProblemStatus.SOLVED, icon: 'check_circle', colorClass: 'status-solved' },
    { label: 'Needs Revision', value: ProblemStatus.NEEDS_REVISION, icon: 'update', colorClass: 'status-needs-revision' },
    { label: 'Mastered', value: ProblemStatus.MASTERED, icon: 'military_tech', colorClass: 'status-mastered' }
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
    'SQL',
    'Kotlin',
    'Swift'
  ];

  readonly quickTimePresets = [15, 30, 45, 60, 90];

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

  get selectedStatusOption(): StatusOption {
    const val = this.editForm?.get('status')?.value;
    return this.statusOptions.find((o) => o.value === val) || this.statusOptions[2];
  }

  get isFavorite(): boolean {
    return Boolean(this.editForm?.get('favorite')?.value);
  }

  get formattedDifficulty(): string {
    const diff = this.data.problem?.difficulty || '';
    switch (diff.toUpperCase()) {
      case 'EASY': return 'Easy';
      case 'MEDIUM': return 'Medium';
      case 'HARD': return 'Hard';
      default: return diff ? diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase() : 'Medium';
    }
  }

  get difficultyClass(): string {
    return (this.data.problem?.difficulty || 'medium').toLowerCase();
  }

  toggleFavorite(): void {
    this.editForm.patchValue({
      favorite: !this.isFavorite
    });
  }

  setTimePreset(minutes: number): void {
    const current = this.editForm.get('time_taken_minutes')?.value;
    this.editForm.patchValue({
      time_taken_minutes: current === minutes ? null : minutes
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
      time_taken_minutes: val.time_taken_minutes !== null && val.time_taken_minutes !== '' ? Number(val.time_taken_minutes) : null,
      favorite: Boolean(val.favorite),
      solution_url: val.solution_url ? val.solution_url.trim() : null,
      notes: val.notes ? val.notes.trim() : null
    };

    this.myProblemsStore.updateProblem(this.data.id, request, () => {
      this.dialogRef.close(true);
    });
  }
}
