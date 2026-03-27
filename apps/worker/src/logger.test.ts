import { afterEach, describe, expect, it, vi } from 'vitest';
import { log } from './logger';

describe('log', () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  afterEach(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    vi.restoreAllMocks();
  });

  it('writes INFO logs to console.log', () => {
    const infoSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    log('INFO', 'hello');

    expect(infoSpy).toHaveBeenCalledTimes(1);
  });

  it('writes WARN logs to console.warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    log('WARN', 'careful');

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('writes ERROR logs to console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    log('ERROR', 'boom', { reason: 'test' });

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
