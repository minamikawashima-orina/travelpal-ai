import type { ChatMessage } from '@/types/chat';
import type { ChatHistoryState, ChatSession } from '@/types/history';
import { hasUserMessage } from '@/utils/chatHelpers';
import { isTravelConditions } from '@/utils/planHelpers';

// 会話履歴を localStorage に保存・復元する処理
//
// 保存先はこのブラウザだけ（サーバーには送らない）。
// プライベートブラウズや容量不足で保存できなくても、チャット自体は使えるようにしている。

// データの形を変えるときは v2 などに上げ、古いデータで画面が壊れないようにする
const STORAGE_KEY = 'travelpal-chat-history-v1';
const STORAGE_VERSION = 1;
// 容量オーバーを防ぐため、保存する会話の数に上限を設ける
const MAX_SESSIONS = 30;

interface StoredChatHistory extends ChatHistoryState {
  version: typeof STORAGE_VERSION;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === 'string' &&
    (m.role === 'user' || m.role === 'assistant') &&
    typeof m.content === 'string' &&
    typeof m.createdAt === 'number'
  );
}

function isChatSession(value: unknown): value is ChatSession {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.title === 'string' &&
    typeof s.conversationId === 'string' &&
    typeof s.createdAt === 'number' &&
    typeof s.updatedAt === 'number' &&
    Array.isArray(s.messages) &&
    s.messages.length > 0 &&
    s.messages.every(isChatMessage)
  );
}

// 保存済みの履歴を読み込む。なければ・壊れていれば null
export function loadChatHistory(): ChatHistoryState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as Partial<StoredChatHistory> | null;
    if (data?.version !== STORAGE_VERSION || !Array.isArray(data.sessions)) return null;

    // 形の正しくない会話だけを取り除き、残りは復元する
    // 旅行プランの条件が壊れていた場合は、条件だけを捨てて会話は残す
    const sessions = data.sessions
      .filter(isChatSession)
      .map((s) => (s.planConditions === undefined || isTravelConditions(s.planConditions)
        ? s
        : { ...s, planConditions: undefined }));
    if (sessions.length === 0) return null;

    return {
      sessions,
      activeSessionId: typeof data.activeSessionId === 'string' ? data.activeSessionId : '',
    };
  } catch {
    return null;
  }
}

export function saveChatHistory(state: ChatHistoryState): void {
  // まだ何も質問していない会話は、表示中のもの以外は保存しない
  const saved = state.sessions
    .filter((s) => s.id === state.activeSessionId || hasUserMessage(s))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // 上限を超えたら古い会話から削除（表示中の会話は必ず残す）
  const active = saved.find((s) => s.id === state.activeSessionId);
  const others = saved.filter((s) => s !== active).slice(0, active ? MAX_SESSIONS - 1 : MAX_SESSIONS);
  const sessions = active ? [active, ...others] : others;

  const data: StoredChatHistory = {
    version: STORAGE_VERSION,
    activeSessionId: state.activeSessionId,
    sessions,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('会話履歴を保存できませんでした', err);
  }
}
