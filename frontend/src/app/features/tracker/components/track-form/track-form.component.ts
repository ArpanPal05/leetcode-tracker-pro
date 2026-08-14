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
import { ProblemStatus, UserProblemTrackRequest } from '../../models/tracker.models';

export function leetcodeUrlValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value ? String(control.value).trim() : '';
  if (!value) return null;

  if (!value.startsWith('https://leetcode.com/problems/')) {
    return { invalidLeetCodeUrl: true };
  }
  return null;
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
    MatProgressSpinnerModule
  ],
  templateUrl: './track-form.component.html',
  styleUrl: './track-form.component.scss'
})
export class TrackFormComponent {
  @Input() loading = false;
  @Output() submitForm = new EventEmitter<UserProblemTrackRequest>();

  private fb = inject(FormBuilder);

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
    'SQL',
    'Kotlin',
    'Swift'
  ];

  trackForm: FormGroup = this.fb.group({
    leetcode_url: ['', [Validators.required, leetcodeUrlValidator]],
    status: [ProblemStatus.SOLVED, [Validators.required]],
    language: ['Python'],
    time_taken_minutes: [null, [Validators.min(0)]],
    favorite: [false],
    solution_url: ['', [Validators.pattern('https?://.+')]],
    notes: ['', [Validators.maxLength(5000)]]
  });

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
      time_taken_minutes: val.time_taken_minutes !== null ? Number(val.time_taken_minutes) : null,
      favorite: Boolean(val.favorite),
      solution_url: val.solution_url ? val.solution_url.trim() : null,
      notes: val.notes ? val.notes.trim() : null
    };

    this.submitForm.emit(request);
  }
}
