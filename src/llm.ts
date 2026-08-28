import { OpenRouter } from '@openrouter/sdk';
import type { ChatAssistantMessage, ChatMessages, ChatToolCall } from '@openrouter/sdk/models';

import * as tools from './tools/index.js';

export type ToolCall = {
  readonly id: string;
  readonly name: string;
  readonly arguments: string;
};

export type Response = {
  readonly text: string;
  readonly toolCalls: readonly tools.ToolCall[];
};

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('Set OPENROUTER_API_KEY before running the agent.');
  process.exit(1);
}

const model = process.env.OPENROUTER_MODEL ?? 'minimax/minimax-m3:free';
const openRouter = new OpenRouter({ apiKey });
const messages: ChatMessages[] = [];

function messagesFor(turn: string | readonly tools.ToolResult[]): ChatMessages[] {
  if (typeof turn === 'string') return [{ role: 'user', content: turn }];

  return turn.map((result) => ({
    role: 'tool',
    toolCallId: result.id,
    content: result.output,
  }));
}

function textOf(content: ChatAssistantMessage['content']): string {
  return typeof content === 'string' ? content : '';
}

function toolCallsFrom(calls: ChatToolCall[] | undefined): tools.ToolCall[] {
  return (calls ?? []).map((call) => ({
    id: call.id,
    name: call.function.name,
    arguments: call.function.arguments,
  }));
}

export async function complete(turn: string | readonly tools.ToolResult[]): Promise<Response> {
  messages.push(...messagesFor(turn));

  const result = await openRouter.chat.send({
    chatRequest: {
      model,
      stream: false,
      messages,
      tools: tools.schemas,
    },
  });

  const reply = ('choices' in result ? result.choices[0]?.message : undefined) as ChatAssistantMessage | undefined;
  if (!reply) return { text: '', toolCalls: [] };

  messages.push(reply);

  return { text: textOf(reply.content), toolCalls: toolCallsFrom(reply.toolCalls) };
}
