import { apiUrl } from '@/lib/apiConfig';
import type { ChatMessage, ChatContext } from '@/types';

/**
 * Sends a chat message and streams the assistant response chunk by chunk.
 * Calls onChunk for each text fragment; returns the full response text.
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

  if (!res.ok || !res.body) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(errorText || `Server error: ${res.status}`);
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
