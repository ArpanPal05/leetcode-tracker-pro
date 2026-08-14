import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ProblemStatus } from '../../models/my-problems.models';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="filter-panel-row">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Status</mat-label>
        <mat-select
          [value]="selectedStatus"
          (selectionChange)="onStatusChange($event.value)"
        >
          <mat-option [value]="null">All Statuses</mat-option>
          <mat-option *ngFor="let st of statusOptions" [value]="st.value">
            {{ st.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Language</mat-label>
        <mat-select
          [value]="selectedLanguage"
          (selectionChange)="onLanguageChange($event.value)"
        >
          <mat-option [value]="null">All Languages</mat-option>
          <mat-option *ngFor="let lang of languageOptions" [value]="lang">
            {{ lang }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Favorites</mat-label>
        <mat-select
          [value]="selectedFavorite"
          (selectionChange)="onFavoriteChange($event.value)"
        >
          <mat-option [value]="null">All Problems</mat-option>
          <mat-option [value]="true">Favorites Only ★</mat-option>
        </mat-select>
      </mat-form-field>

      <button
        mat-stroked-button
        color="warn"
        type="button"
        (click)="clearFilters.emit()"
        class="clear-btn"
      >
        <mat-icon>filter_alt_off</mat-icon>
        <span>Clear Filters</span>
      </button>
    </div>
  `,
  styles: [`
    .filter-panel-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .filter-field {
      flex: 1;
      min-width: 160px;
      margin-bottom: -1.25em;
    }
    .clear-btn {
      height: 48px;
      margin-bottom: 0.25rem;
    }
  `]
})
export class FilterPanelComponent {
  @Input() selectedStatus: ProblemStatus | null = null;
  @Input() selectedLanguage: string | null = null;
  @Input() selectedFavorite: boolean | null = null;

  @Output() filterChange = new EventEmitter<{
    status?: ProblemStatus | null;
    language?: string | null;
    favorite?: boolean | null;
  }>();

  @Output() clearFilters = new EventEmitter<void>();

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

  onStatusChange(val: ProblemStatus | null): void {
    this.filterChange.emit({ status: val });
  }

  onLanguageChange(val: string | null): void {
    this.filterChange.emit({ language: val });
  }

  onFavoriteChange(val: boolean | null): void {
    this.filterChange.emit({ favorite: val });
  }
}
