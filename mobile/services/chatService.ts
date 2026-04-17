/**
 * Chat service for mobile — mirrors web/services/chatService.ts.
 * Handles streaming responses from /api/chat.
 */

import { apiUrl } from '../lib/config';
import type { ChatMessage, ChatContext } from '../types';

/**
 * Sends a chat message and streams the assistant response chunk by chunk.
 * Calls onChunk for each text fragment; resolves with the full response.
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  context: ChatContext,
  onChunk: (text: string) => void,
): Promise<string> {
  const res = await fetch(apiUrl('/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      throw new Error(
        retryAfter
          ? `Too many messages. Please wait ${retryAfter}s before sending again.`
          : 'Too many messages. Please slow down.',
      );
    }
    try {
      const body = (await res.json()) as { data: null; error: string | null };
      if (body.error) throw new Error(body.error);
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message !== 'body already used') {
        throw parseErr;
      }
    }
    throw new Error(`Chat unavailable (${res.status}). Try again shortly.`);
  }

  if (!res.body) {
    throw new Error('Empty response from server');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk(chunk);
  }

  return full;
}
