import { OpenRouter } from '@openrouter/sdk';
import type { ChatAssistantMessage, ChatMessages } from '@openrouter/sdk/models';

import { readFileTool } from './tools/read-file.js';

export type ToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type Response = {
  text: string;
  toolCall?: ToolCall;
};

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('Set OPENROUTER_API_KEY before running the agent.');
  process.exit(1);
}

const model = process.env.OPENROUTER_MODEL ?? 'minimax/minimax-m3:free';
const openRouter = new OpenRouter({ apiKey });
const messages: ChatMessages[] = [];

function textOf(message: ChatAssistantMessage): string {
  return typeof message.content === 'string' ? message.content : '';
}

export async function complete(userInput: string): Promise<Response> {
  messages.push({ role: 'user', content: userInput });

  const result = await openRouter.chat.send({
    chatRequest: {
      model,
      stream: false,
      messages,
      tools: [readFileTool],
    },
  });

  const reply = ('choices' in result ? result.choices[0]?.message : undefined) as ChatAssistantMessage | undefined;
  if (!reply) return '';

  messages.push(reply);

  const call = reply.toolCalls?.[0];
  if (!call) {
    return { text: textOf(reply) };
  }

  return {
    text: textOf(reply),
    toolCall: {
      id: call.id,
      name: call.function.name,
      arguments: call.function.arguments,
    },
  };
}
