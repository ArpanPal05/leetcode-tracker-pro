import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProblemStatus, UserProblemTrackRequest } from '../../models/tracker.models';

export const LEETCODE_PATTERN = /^https?:\/\/(www\.)?leetcode\.com\/problems\/[a-zA-Z0-9_-]+(\/.*)?$/;
export const CODEFORCES_PATTERN = /^https?:\/\/(www\.)?codeforces\.com\/(problemset\/problem|contest)\/\d+\/[a-zA-Z0-9]+(\/.*)?$/;
export const CODECHEF_PATTERN = /^https?:\/\/(www\.)?codechef\.com\/problems\/[a-zA-Z0-9_-]+(\/.*)?$/;

export function problemUrlValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.value ? String(control.value).trim() : '';
  if (!raw) return null;

  const isLeetCode = LEETCODE_PATTERN.test(raw);
  const isCodeforces = CODEFORCES_PATTERN.test(raw);
  const isCodeChef = CODECHEF_PATTERN.test(raw);

  if (!isLeetCode && !isCodeforces && !isCodeChef) {
    return { invalidProblemUrl: true };
  }

  return null;
}

export interface StatusOption {
  label: string;
  value: ProblemStatus;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-track-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './track-form.component.html',
  styleUrl: './track-form.component.scss'
})
export class TrackFormComponent {
  @Input() loading = false;
  @Output() submitForm = new EventEmitter<UserProblemTrackRequest>();

  private fb = inject(FormBuilder);

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

  trackForm: FormGroup = this.fb.group({
    leetcode_url: ['', [Validators.required, problemUrlValidator]],
    status: [ProblemStatus.SOLVED, [Validators.required]],
    language: ['Python'],
    time_taken_minutes: [null, [Validators.min(0)]],
    favorite: [false],
    solution_url: ['', [Validators.pattern('https?://.+')]],
    notes: ['', [Validators.maxLength(5000)]]
  });

  get urlValue(): string {
    return this.trackForm.get('leetcode_url')?.value || '';
  }

  get isFavorite(): boolean {
    return Boolean(this.trackForm.get('favorite')?.value);
  }

  get detectedPlatform(): 'LeetCode' | 'Codeforces' | 'CodeChef' | null {
    const raw = this.urlValue.trim();
    if (!raw) return null;
    if (LEETCODE_PATTERN.test(raw)) return 'LeetCode';
    if (CODEFORCES_PATTERN.test(raw)) return 'Codeforces';
    if (CODECHEF_PATTERN.test(raw)) return 'CodeChef';
    return null;
  }

  get selectedStatusOption(): StatusOption {
    const val = this.trackForm.get('status')?.value;
    return this.statusOptions.find((o) => o.value === val) || this.statusOptions[2];
  }

  clearUrl(): void {
    this.trackForm.patchValue({ leetcode_url: '' });
    this.trackForm.get('leetcode_url')?.markAsUntouched();
  }

  setTimePreset(minutes: number): void {
    const current = this.trackForm.get('time_taken_minutes')?.value;
    this.trackForm.patchValue({
      time_taken_minutes: current === minutes ? null : minutes
    });
  }

  toggleFavorite(): void {
    this.trackForm.patchValue({
      favorite: !this.isFavorite
    });
  }

  onSubmit(): void {
    if (this.trackForm.invalid) {
      this.trackForm.markAllAsTouched();
      return;
    }

    const val = this.trackForm.value;
    const request: UserProblemTrackRequest = {
      leetcode_url: val.leetcode_url.trim(),
      status: val.status,
      language: val.language || null,
      time_taken_minutes: val.time_taken_minutes !== null && val.time_taken_minutes !== '' ? Number(val.time_taken_minutes) : null,
      favorite: Boolean(val.favorite),
      solution_url: val.solution_url ? val.solution_url.trim() : null,
      notes: val.notes ? val.notes.trim() : null
    };

    this.submitForm.emit(request);
  }
}
