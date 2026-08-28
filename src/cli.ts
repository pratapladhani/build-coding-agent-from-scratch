import { createInterface } from 'node:readline/promises';

import * as sessionLog from './log.js';

const terminal = createInterface({ input: process.stdin, output: process.stdout });
const lines = terminal[Symbol.asyncIterator]();

terminal.setPrompt('You: ');

console.log(`Session log: ${sessionLog.path()}`);

export async function ask(): Promise<string> {
  terminal.prompt();

  const line = await lines.next();

  if (line.done) return goodbye();

  sessionLog.log(`You: ${line.value}`);
  return line.value;
}

export function reply(text: string): void {
  console.log(`Assistant: ${text}`);
  sessionLog.log(`Assistant: ${text}`);
}

export function using(name: string, args: string): void {
  const line = `→ ${name} ${args}`;
  console.log(line);
  sessionLog.log(line);
}

function goodbye(): never {
  terminal.close();
  process.exit(0);
}
