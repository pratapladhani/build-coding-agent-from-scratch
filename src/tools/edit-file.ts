import { readFile, writeFile } from 'node:fs/promises';

type Arguments = {
  path: string;
  oldText: string;
  newText: string;
};

export const schema = {
  type: 'function' as const,
  function: {
    name: 'edit_file',
    description: 'Replace exact text in a UTF-8 file when it appears exactly once.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        oldText: { type: 'string' },
        newText: { type: 'string' },
      },
      required: ['path', 'oldText', 'newText'],
    },
  },
};

export async function run(argumentsJson: string): Promise<string> {
  const { path, oldText, newText } = JSON.parse(argumentsJson) as Arguments;
  const before = await readFile(path, 'utf8');
  const matches = before.split(oldText).length - 1;

  if (matches !== 1) return `Found ${matches} of that text in ${path}; it has to appear exactly once.`;

  await writeFile(path, before.replace(oldText, newText));
  return `Edited ${path}`;
}