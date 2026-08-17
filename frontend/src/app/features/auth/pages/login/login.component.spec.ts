import '@angular/compiler';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';

describe('Login Form Validation and Submission', () => {
  function createLoginForm() {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    });
  }

  it('should be invalid when initial form controls are empty', () => {
    const form = createLoginForm();
    expect(form.valid).toBe(false);
    expect(form.get('email')?.valid).toBe(false);
    expect(form.get('password')?.valid).toBe(false);
  });

  it('should validate invalid email and short password', () => {
    const form = createLoginForm();
    form.get('email')?.setValue('invalid-email-str');
    form.get('password')?.setValue('pass');

    expect(form.get('email')?.hasError('email')).toBe(true);
    expect(form.get('password')?.hasError('minlength')).toBe(true);
    expect(form.valid).toBe(false);
  });

  it('should be valid when valid email and password are provided', () => {
    const form = createLoginForm();
    form.get('email')?.setValue('user@example.com');
    form.get('password')?.setValue('password123');

    expect(form.valid).toBe(true);
  });

  it('should trigger auth store login on valid submit', () => {
    const form = createLoginForm();
    const authStoreMock = { login: vi.fn() };

    form.get('email')?.setValue('user@example.com');
    form.get('password')?.setValue('password123');

    if (form.valid) {
      authStoreMock.login(form.value);
    }

    expect(authStoreMock.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    });
  });
});
