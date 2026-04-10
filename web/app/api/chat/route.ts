import { NextRequest } from 'next/server';
import type { ChatRequest } from '@/types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const SYSTEM_INSTRUCTION = `You are NutriAI, a knowledgeable and supportive nutrition coach built into a food tracking app.

You have access to the user's daily nutrition context (calories consumed vs. goals, recent meals).
Use this context when relevant — give specific, personalised advice rather than generic tips.

Guidelines:
- Be concise and direct. No fluff.
- When discussing macros/calories, use the exact numbers from the user's context.
- Suggest real foods with approximate nutrition values when asked.
- If asked about medical conditions, recommend consulting a doctor but still provide general nutrition info.
- Keep responses under 200 words unless the user explicitly asks for more detail.
- No bullet spam — use prose or 2-3 focused points max.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  const { messages, context } = (await req.json()) as ChatRequest;

  // Build Gemini multi-turn contents (most recent 20 messages to stay within limits)
  const recentMessages = messages.slice(-20);
  const contents = recentMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Inject user context into the first user message as a prefix
  const contextBlock = `[User nutrition context — today: ${Math.round(context.consumed.calories)} / ${context.goals.calories} kcal consumed, ${Math.round(context.consumed.protein)} / ${context.goals.protein}g protein, ${Math.round(context.consumed.carbs)} / ${context.goals.carbs}g carbs, ${Math.round(context.consumed.fat)} / ${context.goals.fat}g fat. Recent meals: ${context.recentMeals.length ? context.recentMeals.slice(0, 5).join('; ') : 'none yet'}]\n\n`;

  if (contents.length > 0 && contents[0].role === 'user') {
    contents[0].parts[0].text = contextBlock + contents[0].parts[0].text;
  }

  const body = {
    contents,
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  const geminiRes = await fetch(
    `${GEMINI_API_BASE}/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!geminiRes.ok || !geminiRes.body) {
    const errorText = await geminiRes.text();
    return Response.json({ error: `Gemini error: ${errorText}` }, { status: 502 });
  }

  // Pipe Gemini SSE → plain text stream
  const geminiBody = geminiRes.body;
  const stream = new ReadableStream({
    async start(controller) {
      const reader = geminiBody.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') continue;
            try {
              const json = JSON.parse(raw) as {
                candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
              };
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) controller.enqueue(new TextEncoder().encode(text));
            } catch {
              // skip malformed chunk
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
