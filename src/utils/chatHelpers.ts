import type { ChatMessage, MessageRole } from '@/types/chat';

// チャットメッセージのユーティリティ関数群
// 画面表示用の処理をここに集約し、UIコンポーネントは純粋な表示に専念させる

let messageCounter = 0;

export function createMessage(role: MessageRole, content: string): ChatMessage {
  messageCounter += 1;
  return {
    id: `msg-${Date.now()}-${messageCounter}`,
    role,
    content,
    createdAt: Date.now(),
  };
}

export function createWelcomeMessage(): ChatMessage {
  return createMessage(
    'assistant',
    '旅のプランづくり、お手伝いします!\n行き先・日数・予算・人数・好みなどを気軽に教えてくださいね。',
  );
}
