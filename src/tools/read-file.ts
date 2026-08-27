export const readFileTool = {
  type: 'function',
  function: {
    name: 'read_file',
    description: 'Read a file from disk',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' },
      },
      required: ['path'],
    },
  },
};