import { appendFileSync, mkdirSync } from 'node:fs';

const file = `logs/session-${new Date().toISOString().replaceAll(':', '-')}.log`;

mkdirSync('logs', { recursive: true });

export function log(line: string): void {
  appendFileSync(file, `${line}\n`);
}

export function path(): string {
  return file;
}