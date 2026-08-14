import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ChangePasswordRequest } from '../../models/profile.models';
import { ProfileStore } from '../../store/profile.store';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const newPass = control.get('new_password')?.value;
  const confirmPass = control.get('confirm_password')?.value;
  return newPass && confirmPass && newPass !== confirmPass
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-wrapper">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon color="accent">lock_reset</mat-icon>
        <span>Change Password</span>
      </h2>

      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="dialog-content">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Current Password</mat-label>
            <input matInput type="password" formControlName="current_password" />
            <mat-icon matSuffix>lock</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Password *</mat-label>
            <input matInput type="password" formControlName="new_password" />
            <mat-icon matSuffix>key</mat-icon>
            <mat-error *ngIf="passwordForm.get('new_password')?.hasError('minlength')">
              Password must be at least 6 characters.
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirm New Password *</mat-label>
            <input matInput type="password" formControlName="confirm_password" />
            <mat-icon matSuffix>key</mat-icon>
            <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
              Passwords do not match.
            </mat-error>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="passwordForm.invalid || profileStore.updating()"
          >
            {{ profileStore.updating() ? 'Changing...' : 'Change Password' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      min-width: 400px;
    }
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class ChangePasswordDialogComponent {
  private fb = inject(FormBuilder);
  readonly profileStore = inject(ProfileStore);

  passwordForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<ChangePasswordDialogComponent>) {
    this.passwordForm = this.fb.group(
      {
        current_password: [''],
        new_password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const request: ChangePasswordRequest = this.passwordForm.value;
    this.profileStore.changePassword(request, () => {
      this.dialogRef.close();
    });
  }
}
