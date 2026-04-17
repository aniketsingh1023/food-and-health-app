/**
 * POST /api/chat
 * Streams an AI nutrition coach response via Server-Sent Events.
 *
 * Data flow note: this is a server-side route. It has NO access to the
 * client's localStorage. The caller (chatService.ts / the page component)
 * is responsible for reading today's food log from localStorage and passing
 * it as `context.consumed`, `context.goals`, and `context.recentMeals` in
 * the request body. The route simply uses whatever context is provided.
 */

import { NextRequest } from 'next/server';
import type { ChatRequest, ChatMessage, ChatContext, ApiResponse } from '@/types';
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';

const ROUTE = 'chat';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 20;

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

/** Returns a plain JSON error Response that matches ApiResponse<null>. */
function errorResponse(message: string, status: number): Response {
  const body: ApiResponse<null> = { data: null, error: message };
  return Response.json(body, { status });
}

function isValidMacros(obj: unknown): obj is { calories: number; protein: number; carbs: number; fat: number; fiber: number } {
  if (typeof obj !== 'object' || obj === null) return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.calories === 'number' &&
    typeof m.protein  === 'number' &&
    typeof m.carbs    === 'number' &&
    typeof m.fat      === 'number' &&
    typeof m.fiber    === 'number'
  );
}

function isValidContext(ctx: unknown): ctx is ChatContext {
  if (typeof ctx !== 'object' || ctx === null) return false;
  const c = ctx as Record<string, unknown>;
  return (
    isValidMacros(c.consumed) &&
    isValidMacros(c.goals) &&
    Array.isArray(c.recentMeals) &&
    (c.recentMeals as unknown[]).every(m => typeof m === 'string')
  );
}

function isValidMessages(msgs: unknown): msgs is ChatMessage[] {
  if (!Array.isArray(msgs) || msgs.length === 0) return false;
  return (msgs as unknown[]).every(m => {
    if (typeof m !== 'object' || m === null) return false;
    const msg = m as Record<string, unknown>;
    return (
      typeof msg.id      === 'string' &&
      typeof msg.content === 'string' &&
      (msg.role === 'user' || msg.role === 'assistant') &&
      typeof msg.createdAt === 'string'
    );
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = checkRateLimit(`${ROUTE}:${ip}`, RATE_LIMITS[ROUTE]);
  if (!rl.allowed) {
    logger.warn(ROUTE, 'Rate limit exceeded', { ip, retryAfterMs: rl.retryAfterMs });
    return Response.json(
      { data: null, error: 'Too many requests. Please try again shortly.' } satisfies ApiResponse<null>,
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    );
  }

  // ── API key check ──────────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error(ROUTE, 'GEMINI_API_KEY not configured');
    return errorResponse('Service misconfigured', 500);
  }

  // ── Body parsing ───────────────────────────────────────────────────────────
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return errorResponse('Invalid request body', 400);
  }

  const { messages, context } = parsed as Partial<ChatRequest>;

  // ── Input validation ───────────────────────────────────────────────────────
  if (!isValidMessages(messages)) {
    return errorResponse('messages must be a non-empty array of ChatMessage objects', 400);
  }

  if (!isValidContext(context)) {
    return errorResponse('context must include consumed macros, goals, and recentMeals', 400);
  }

  // Enforce per-message length limit
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  if (lastUserMessage && lastUserMessage.content.length > MAX_MESSAGE_LENGTH) {
    return errorResponse(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`, 400);
  }

  // ── Build Gemini request ───────────────────────────────────────────────────
  // Cap history at MAX_HISTORY_MESSAGES — already validated non-empty above
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
  const contents = recentMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Inject nutrition context as a prefix on the first user turn
  const contextBlock =
    `[User nutrition context — today: ${Math.round(context.consumed.calories)} / ${context.goals.calories} kcal consumed, ` +
    `${Math.round(context.consumed.protein)} / ${context.goals.protein}g protein, ` +
    `${Math.round(context.consumed.carbs)} / ${context.goals.carbs}g carbs, ` +
    `${Math.round(context.consumed.fat)} / ${context.goals.fat}g fat. ` +
    `Recent meals: ${context.recentMeals.length ? context.recentMeals.slice(0, 5).join('; ') : 'none yet'}]\n\n`;

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

  // ── Gemini call with model fallback ───────────────────────────────────────
  const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];
  let geminiRes: Response | null = null;

  for (const model of MODELS) {
    const res = await fetch(
      `${GEMINI_API_BASE}/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    );
    if (res.status === 503 || res.status === 429) continue;
    geminiRes = res;
    break;
  }

  if (!geminiRes || !geminiRes.ok || !geminiRes.body) {
    const errorText = geminiRes ? await geminiRes.text() : 'All models unavailable';
    logger.error(ROUTE, `Gemini stream error: ${errorText}`, { ip });
    return errorResponse('AI service temporarily unavailable', 502);
  }

  // ── Pipe Gemini SSE → plain text stream ───────────────────────────────────
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
              // skip malformed SSE chunk
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
