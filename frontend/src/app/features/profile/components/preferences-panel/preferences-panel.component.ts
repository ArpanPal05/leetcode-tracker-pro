import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserPreferences } from '../../models/profile.models';

@Component({
  selector: 'app-profile-preferences-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-card class="pref-card">
      <div class="card-header">
        <h3>Application Preferences</h3>
        <p>Customize your tracking experience and defaults</p>
      </div>

      <form [formGroup]="prefForm" (ngSubmit)="onSubmit()" class="pref-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Theme</mat-label>
            <mat-select formControlName="theme">
              <mat-option value="dark">Dark Theme (Default)</mat-option>
              <mat-option value="light">Light Theme</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Default Programming Language</mat-label>
            <mat-select formControlName="language">
              <mat-option *ngFor="let lang of languageOptions" [value]="lang">
                {{ lang }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Default Tracking Status</mat-label>
            <mat-select formControlName="defaultStatus">
              <mat-option value="SOLVED">Solved</mat-option>
              <mat-option value="ATTEMPTING">Attempting</mat-option>
              <mat-option value="NEEDS_REVISION">Needs Revision</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="toggle-wrapper">
            <mat-slide-toggle formControlName="notifications" color="primary">
              Enable Push Notifications
            </mat-slide-toggle>
          </div>
        </div>

        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit">
            <mat-icon>settings</mat-icon>
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </mat-card>
  `,
  styles: [`
    .pref-card {
      background-color: #1e293b !important;
      color: #f8fafc !important;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .card-header {
      margin-bottom: 1.25rem;

      h3 {
        font-size: 1.125rem;
        font-weight: 700;
        color: #f8fafc;
        margin: 0 0 0.25rem 0;
      }
      p {
        font-size: 0.8125rem;
        color: #94a3b8;
        margin: 0;
      }
    }
    .pref-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      align-items: center;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }
    .filter-field {
      width: 100%;
    }
    .toggle-wrapper {
      padding: 0.5rem 0;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }
  `]
})
export class PreferencesPanelComponent implements OnChanges {
  @Input() preferences: UserPreferences | null = null;
  @Output() updatePreferences = new EventEmitter<UserPreferences>();

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

  prefForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.prefForm = this.fb.group({
      theme: ['dark'],
      language: ['Python'],
      defaultStatus: ['SOLVED'],
      notifications: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preferences'] && this.preferences) {
      this.prefForm.patchValue(this.preferences);
    }
  }

  onSubmit(): void {
    this.updatePreferences.emit(this.prefForm.value);
  }
}
