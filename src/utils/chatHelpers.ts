import type { ChatMessage, MessageRole } from '@/types/chat';
import type { ChatSession } from '@/types/history';

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

const DEFAULT_SESSION_TITLE = '新しい会話';
const MAX_TITLE_LENGTH = 30;

let sessionCounter = 0;

// 新しい会話（ウェルカムメッセージだけの状態）を作成
export function createSession(): ChatSession {
  sessionCounter += 1;
  const now = Date.now();
  return {
    id: `session-${now}-${sessionCounter}`,
    title: DEFAULT_SESSION_TITLE,
    messages: [createWelcomeMessage()],
    conversationId: '',
    createdAt: now,
    updatedAt: now,
  };
}

// ユーザーが1回でも質問した会話かどうか（履歴に表示するかの判定に使う）
export function hasUserMessage(session: ChatSession): boolean {
  return session.messages.some((m) => m.role === 'user');
}

// 最初の質問文から、履歴一覧に表示するタイトルを作成
export function createSessionTitle(text: string): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  if (!oneLine) return DEFAULT_SESSION_TITLE;
  return oneLine.length > MAX_TITLE_LENGTH ? `${oneLine.slice(0, MAX_TITLE_LENGTH)}…` : oneLine;
}
