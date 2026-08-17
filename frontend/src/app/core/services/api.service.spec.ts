import '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpClientMock: any;

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    };

    const mockInjector = {
      get: (token: any) => {
        if (token === HttpClient) return httpClientMock;
        return null;
      }
    };

    runInInjectionContext(mockInjector as EnvironmentInjector, () => {
      service = new ApiService();
    });
  });

  it('should construct GET request with query params', () => {
    service.get('/user-problems', { page: 1, search: 'sum' });

    expect(httpClientMock.get).toHaveBeenCalled();
    const callArgs = httpClientMock.get.mock.calls[0];
    expect(callArgs[0]).toBe(`${environment.apiUrl}/user-problems`);
  });

  it('should construct POST request with body', () => {
    const body = { url: 'https://leetcode.com/problems/two-sum' };
    service.post('/problem-import', body);

    expect(httpClientMock.post).toHaveBeenCalledWith(
      `${environment.apiUrl}/problem-import`,
      body
    );
  });

  it('should construct PUT request', () => {
    const body = { status: 'SOLVED' };
    service.put('/user-problems/1', body);

    expect(httpClientMock.put).toHaveBeenCalledWith(
      `${environment.apiUrl}/user-problems/1`,
      body
    );
  });

  it('should construct DELETE request', () => {
    service.delete('/user-problems/1');

    expect(httpClientMock.delete).toHaveBeenCalledWith(
      `${environment.apiUrl}/user-problems/1`
    );
  });
});
