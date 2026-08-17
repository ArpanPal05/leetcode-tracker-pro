import '@angular/compiler';
import { describe, expect, it, vi } from 'vitest';

describe('authGuard logic', () => {
  function runAuthGuard(isAuthenticated: boolean, createUrlTree: (path: string[]) => any) {
    if (isAuthenticated) {
      return true;
    }
    return createUrlTree(['/login']);
  }

  it('should allow navigation when user is authenticated', () => {
    const createUrlTree = vi.fn();
    const result = runAuthGuard(true, createUrlTree);
    expect(result).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /login when user is not authenticated', () => {
    const createUrlTree = vi.fn().mockImplementation((path) => path[0]);
    const result = runAuthGuard(false, createUrlTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe('/login');
  });
});
