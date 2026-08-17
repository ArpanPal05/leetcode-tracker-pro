import '@angular/compiler';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let storageServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    storageServiceMock = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn()
    };
    routerMock = {
      navigate: vi.fn()
    };

    const mockInjector = {
      get: (token: any) => {
        if (token === StorageService) return storageServiceMock;
        if (token === Router) return routerMock;
        return null;
      }
    };

    runInInjectionContext(mockInjector as EnvironmentInjector, () => {
      service = new AuthService();
    });
  });

  it('should retrieve token from storage service', () => {
    storageServiceMock.get.mockReturnValue('test-token-jwt');
    expect(service.getToken()).toBe('test-token-jwt');
    expect(storageServiceMock.get).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
  });

  it('should clear tokens and reset signals on clearToken', () => {
    service.clearToken();
    expect(storageServiceMock.remove).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
    expect(storageServiceMock.remove).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN);
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should clear tokens and navigate to /login on logout', () => {
    service.logout();
    expect(storageServiceMock.remove).toHaveBeenCalledWith(STORAGE_KEYS.ACCESS_TOKEN);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
