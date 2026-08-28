import { readFileSync } from 'node:fs';

import * as cli from '../cli.js';
import { readFileTool } from './read-file.js';

type ToolArguments = {
  path: string;
};

export type ToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type ToolResult = {
  id: string;
  output: string;
};

export const schemas = [readFileTool];

export function runTool(name: string, argumentsJson: string): string {
  const argumentsObject = JSON.parse(argumentsJson) as ToolArguments;

  if (name === 'read_file') {
    return readFileSync(argumentsObject.path, 'utf8');
  }

  return '';
}

export function run(toolCalls: readonly ToolCall[]): Promise<ToolResult[]> {
  return Promise.all(toolCalls.map(runOne));
}

async function runOne(call: ToolCall): Promise<ToolResult> {
  cli.using(call.name, call.arguments);

  return { id: call.id, output: runTool(call.name, call.arguments) };
}