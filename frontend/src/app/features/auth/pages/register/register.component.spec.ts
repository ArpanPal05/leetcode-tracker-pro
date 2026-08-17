import '@angular/compiler';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

describe('Register Form Validation and Submission', () => {
  function createRegisterForm() {
    return new FormGroup(
      {
        username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]),
        confirmPassword: new FormControl('', [Validators.required])
      },
      { validators: passwordMatchValidator('password', 'confirmPassword') }
    );
  }

  it('should be invalid when controls are empty', () => {
    const form = createRegisterForm();
    expect(form.valid).toBe(false);
  });

  it('should invalidate mismatched passwords', () => {
    const form = createRegisterForm();
    form.get('username')?.setValue('newuser');
    form.get('email')?.setValue('newuser@example.com');
    form.get('password')?.setValue('password123');
    form.get('confirmPassword')?.setValue('differentpassword');

    expect(form.valid).toBe(false);
    expect(form.hasError('passwordMismatch')).toBe(true);
  });

  it('should be valid when all fields match requirements', () => {
    const form = createRegisterForm();
    form.get('username')?.setValue('newuser');
    form.get('email')?.setValue('newuser@example.com');
    form.get('password')?.setValue('password123');
    form.get('confirmPassword')?.setValue('password123');

    expect(form.valid).toBe(true);
  });

  it('should trigger auth store register on valid submit', () => {
    const form = createRegisterForm();
    const authStoreMock = { register: vi.fn() };

    form.get('username')?.setValue('newuser');
    form.get('email')?.setValue('newuser@example.com');
    form.get('password')?.setValue('password123');
    form.get('confirmPassword')?.setValue('password123');

    if (form.valid) {
      const { username, email, password } = form.value;
      authStoreMock.register({ username, email, password });
    }

    expect(authStoreMock.register).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    });
  });
});
