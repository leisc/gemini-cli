/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getErrorMessage, isNodeError } from './errors.js';
import { URL } from 'node:url';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import { socksDispatcher } from 'fetch-socks';

const PRIVATE_IP_RANGES = [
  /^10\./,
  /^127\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

export class FetchError extends Error {
  constructor(
    message: string,
    public code?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'FetchError';
  }
}

export function isPrivateIp(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return PRIVATE_IP_RANGES.some((range) => range.test(hostname));
  } catch (_e) {
    return false;
  }
}

export async function fetchWithTimeout(
  url: string,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } catch (error) {
    if (isNodeError(error) && error.code === 'ABORT_ERR') {
      throw new FetchError(`Request timed out after ${timeout}ms`, 'ETIMEDOUT');
    }
    throw new FetchError(getErrorMessage(error), undefined, { cause: error });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function setGlobalProxy(proxy: string) {
  try {
    const url = new URL(proxy);
    if (
      url.protocol === 'socks5:' ||
      url.protocol === 'socks5h:' ||
      url.protocol.startsWith('socks')
    ) {
      setGlobalDispatcher(
        socksDispatcher({
          type: 5,
          host: url.hostname,
          port: Number(url.port) || 1080,
          userId: url.username,
          password: url.password,
        }),
      );
      return;
    }
  } catch {
    // ignore invalid URLs, let ProxyAgent handle or fail
  }
  setGlobalDispatcher(new ProxyAgent(proxy));
}
