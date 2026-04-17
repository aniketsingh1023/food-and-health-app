/**
 * Structured server-side logger.
 *
 * Outputs newline-delimited JSON to stdout/stderr so Cloud Run's logging agent
 * can parse fields (severity, route, timestamp, etc.) without additional config.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.error('analyze-food', err, { description: 'avocado toast' });
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  severity: Uppercase<LogLevel>;
  timestamp: string;
  route: string;
  message: string;
  errorType?: string;
  [key: string]: unknown;
}

function log(
  level: LogLevel,
  route: string,
  messageOrError: string | Error,
  extra?: Record<string, unknown>,
): void {
  const isError = messageOrError instanceof Error;
  const entry: LogEntry = {
    severity: level.toUpperCase() as Uppercase<LogLevel>,
    timestamp: new Date().toISOString(),
    route,
    message: isError ? messageOrError.message : messageOrError,
    ...(isError && { errorType: messageOrError.constructor.name }),
    ...extra,
  };

  const output = JSON.stringify(entry);
  if (level === 'error') {
    process.stderr.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }
}

export const logger = {
  info:  (route: string, message: string, extra?: Record<string, unknown>) =>
    log('info', route, message, extra),
  warn:  (route: string, message: string, extra?: Record<string, unknown>) =>
    log('warn', route, message, extra),
  error: (route: string, err: string | Error, extra?: Record<string, unknown>) =>
    log('error', route, err, extra),
};
