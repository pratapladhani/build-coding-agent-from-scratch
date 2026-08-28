import { readFileSync } from 'node:fs';

import * as cli from '../cli.js';
import * as editFile from './edit-file.js';
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

type Runner = (argumentsJson: string) => Promise<string>;

export const schemas = [readFileTool, editFile.schema];

const runners: Record<string, Runner> = {
  read_file: async (argumentsJson) => runTool('read_file', argumentsJson),
  edit_file: editFile.run,
};

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

  const runner = runners[call.name];
  const output = runner
    ? await runner(call.arguments)
    : `There is no tool called ${call.name}.`;

  return { id: call.id, output };
}