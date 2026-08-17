import '@angular/compiler';
import { describe, expect, it, beforeEach } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
    localStorage.clear();
  });

  it('should store and retrieve string values in localStorage', () => {
    service.set('token_key', 'my-jwt-token');
    expect(service.get<string>('token_key')).toBe('my-jwt-token');
  });

  it('should store and parse objects in localStorage', () => {
    const data = { user: 'john_doe', role: 'admin' };
    service.set('user_data', data);
    expect(service.get<typeof data>('user_data')).toEqual(data);
  });

  it('should return null for non-existent key', () => {
    expect(service.get('non_existent_key')).toBeNull();
  });

  it('should remove item by key', () => {
    service.set('temp_key', 'temp_value');
    service.remove('temp_key');
    expect(service.get('temp_key')).toBeNull();
  });

  it('should clear all items', () => {
    service.set('key1', 'val1');
    service.set('key2', 'val2');
    service.clear();
    expect(service.get('key1')).toBeNull();
    expect(service.get('key2')).toBeNull();
  });
});
