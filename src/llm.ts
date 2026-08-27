import { OpenRouter } from '@openrouter/sdk';

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('Set OPENROUTER_API_KEY before running the agent.');
  process.exit(1);
}

const model = process.env.OPENROUTER_MODEL ?? 'minimax/minimax-m3:free';
const openRouter = new OpenRouter({ apiKey });
const messages: { role: 'user' | 'assistant'; content: string }[] = [];

export async function complete(userInput: string): Promise<string> {
  messages.push({ role: 'user', content: userInput });

  const result = await openRouter.chat.send({
    chatRequest: {
      model,
      stream: false,
      messages,
    },
  });

  const content = 'choices' in result ? result.choices[0]?.message.content : null;

  const reply = typeof content === 'string' ? content : '';
  messages.push({ role: 'assistant', content: reply });

  return reply;
}
