import { readFileSync } from 'node:fs';

import { readFileTool } from './read-file.js';

type ToolArguments = {
  path: string;
};

export const tools = [readFileTool];

export function runTool(name: string, argumentsJson: string): string {
  const argumentsObject = JSON.parse(argumentsJson) as ToolArguments;

  if (name === 'read_file') {
    return readFileSync(argumentsObject.path, 'utf8');
  }

  return '';
}