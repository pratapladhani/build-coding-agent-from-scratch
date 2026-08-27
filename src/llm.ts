import { OpenRouter } from '@openrouter/sdk';
import type { ChatAssistantMessage, ChatMessages } from '@openrouter/sdk/models';

import { runTool } from './tools/index.js';
import { readFileTool } from './tools/read-file.js';

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

export async function complete(userInput: string): Promise<string> {
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
    return textOf(reply);
  }

  messages.push({
    role: 'tool',
    toolCallId: call.id,
    content: runTool(call.function.name, call.function.arguments),
  });

  const followUp = await openRouter.chat.send({
    chatRequest: {
      model,
      stream: false,
      messages,
      tools: [readFileTool],
    },
  });
  const finalReply = ('choices' in followUp ? followUp.choices[0]?.message : undefined) as ChatAssistantMessage | undefined;
  if (!finalReply) return '';

  messages.push(finalReply);
  return textOf(finalReply);
}
