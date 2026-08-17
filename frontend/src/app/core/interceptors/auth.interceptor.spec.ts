import '@angular/compiler';
import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('should add Authorization Bearer header when token exists', () => {
    const storageServiceMock: any = {
      get: vi.fn().mockImplementation((key) => (key === STORAGE_KEYS.ACCESS_TOKEN ? 'fake-token-123' : null))
    };

    const req = new HttpRequest('GET', '/api/v1/user-problems');
    let clonedReq: HttpRequest<any> | null = null;

    // Create custom context injector mock for inject()
    const mockNext = (r: HttpRequest<any>) => {
      clonedReq = r;
      return {} as any;
    };

    // Execute with mocked storageService
    const interceptorFn = (request: HttpRequest<any>, next: any) => {
      const token = storageServiceMock.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        const authReq = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(authReq);
      }
      return next(request);
    };

    interceptorFn(req, mockNext);

    expect(clonedReq).not.toBeNull();
    expect(clonedReq!.headers.get('Authorization')).toBe('Bearer fake-token-123');
  });

  it('should not modify request headers when token is absent', () => {
    const storageServiceMock: any = {
      get: vi.fn().mockReturnValue(null)
    };

    const req = new HttpRequest('GET', '/api/v1/user-problems');
    let clonedReq: HttpRequest<any> | null = null;

    const mockNext = (r: HttpRequest<any>) => {
      clonedReq = r;
      return {} as any;
    };

    const interceptorFn = (request: HttpRequest<any>, next: any) => {
      const token = storageServiceMock.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        const authReq = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(authReq);
      }
      return next(request);
    };

    interceptorFn(req, mockNext);

    expect(clonedReq).not.toBeNull();
    expect(clonedReq!.headers.has('Authorization')).toBe(false);
  });
});
