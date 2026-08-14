import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UpdateProfileRequest, UserProfile } from '../../models/profile.models';

@Component({
  selector: 'app-profile-information',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-card class="info-card">
      <div class="card-header">
        <h3>Personal Information</h3>
        <p>Update your personal account details</p>
      </div>

      <form [formGroup]="infoForm" (ngSubmit)="onSubmit()" class="info-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="full_name" placeholder="e.g. Alex Johnson" />
          <mat-icon matSuffix>person</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email Address</mat-label>
          <input matInput type="email" formControlName="email" placeholder="alex@example.com" />
          <mat-icon matSuffix>email</mat-icon>
          <mat-error *ngIf="infoForm.get('email')?.hasError('email')">
            Please enter a valid email address.
          </mat-error>
        </mat-form-field>

        <div class="form-actions">
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="infoForm.invalid || updating"
          >
            <mat-icon>save</mat-icon>
            <span>{{ updating ? 'Saving...' : 'Save Profile Changes' }}</span>
          </button>
        </div>
      </form>
    </mat-card>
  `,
  styles: [`
    .info-card {
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
    .info-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .full-width {
        width: 100%;
      }
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }
  `]
})
export class ProfileInformationComponent implements OnChanges {
  @Input() profile: UserProfile | null = null;
  @Input() updating = false;

  @Output() updateProfile = new EventEmitter<UpdateProfileRequest>();

  infoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.infoForm = this.fb.group({
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profile'] && this.profile) {
      this.infoForm.patchValue({
        full_name: this.profile.full_name || '',
        email: this.profile.email || ''
      });
    }
  }

  onSubmit(): void {
    if (this.infoForm.invalid) return;
    this.updateProfile.emit(this.infoForm.value);
  }
}
