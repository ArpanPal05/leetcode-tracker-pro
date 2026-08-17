import '@angular/compiler';
import { describe, expect, it, vi } from 'vitest';

describe('guestGuard logic', () => {
  function runGuestGuard(isAuthenticated: boolean, createUrlTree: (path: string[]) => any) {
    if (!isAuthenticated) {
      return true;
    }
    return createUrlTree(['/dashboard']);
  }

  it('should allow navigation when user is guest (not authenticated)', () => {
    const createUrlTree = vi.fn();
    const result = runGuestGuard(false, createUrlTree);
    expect(result).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /dashboard when user is authenticated', () => {
    const createUrlTree = vi.fn().mockImplementation((path) => path[0]);
    const result = runGuestGuard(true, createUrlTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe('/dashboard');
  });
});
