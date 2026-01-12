/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setGlobalProxy } from './fetch.js';
import { setGlobalDispatcher, ProxyAgent } from 'undici';
import { socksDispatcher } from 'fetch-socks';

vi.mock('undici', async (importOriginal) => ({
  ...(await importOriginal<typeof import('undici')>()),
  setGlobalDispatcher: vi.fn(),
  ProxyAgent: vi.fn(),
}));

vi.mock('fetch-socks', () => ({
  socksDispatcher: vi.fn(),
}));

describe('setGlobalProxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use ProxyAgent for http/https proxies', () => {
    setGlobalProxy('http://proxy.example.com:8080');
    expect(ProxyAgent).toHaveBeenCalledWith('http://proxy.example.com:8080');
    expect(setGlobalDispatcher).toHaveBeenCalled();
    expect(socksDispatcher).not.toHaveBeenCalled();
  });

  it('should use socksDispatcher for socks5 proxies', () => {
    setGlobalProxy('socks5://proxy.example.com:1080');
    expect(socksDispatcher).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 5,
        host: 'proxy.example.com',
        port: 1080,
      }),
    );
    expect(setGlobalDispatcher).toHaveBeenCalled();
    expect(ProxyAgent).not.toHaveBeenCalled();
  });

  it('should use socksDispatcher for socks5h proxies', () => {
    setGlobalProxy('socks5h://proxy.example.com:1080');
    expect(socksDispatcher).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 5,
        host: 'proxy.example.com',
        port: 1080,
      }),
    );
    expect(setGlobalDispatcher).toHaveBeenCalled();
  });

  it('should handle authentication in socks proxy url', () => {
    setGlobalProxy('socks5://user:pass@proxy.example.com:1080');
    expect(socksDispatcher).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 5,
        host: 'proxy.example.com',
        port: 1080,
        userId: 'user',
        password: 'pass',
      }),
    );
    expect(setGlobalDispatcher).toHaveBeenCalled();
  });

  it('should fallback to ProxyAgent for invalid URLs or other protocols', () => {
    // If URL parsing fails or protocol is not socks, it falls back to ProxyAgent
    // Note: URL parsing might throw for some invalid strings, logic has try-catch
    setGlobalProxy('ftp://proxy.example.com');
    expect(ProxyAgent).toHaveBeenCalledWith('ftp://proxy.example.com');
  });
});
