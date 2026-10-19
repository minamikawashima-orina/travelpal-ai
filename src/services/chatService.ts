import type {
  ChatApiErrorResponse,
  ChatApiRequest,
  ChatApiResponse,
  ChatSendOptions,
} from '@/types/chat';
import { createMessage } from '@/utils/chatHelpers';

// チャットの送信処理を担うサービス層
//
// ブラウザからは自分のサイトの `/api/chat`（netlify/functions/chat.ts）だけを呼び出す。
// Dify の APIキーはサーバー側で付与されるため、このファイルには登場しない。

export interface ChatService {
  sendMessage: (userMessage: string, options: ChatSendOptions) => Promise<void>;
}

const CHAT_API_PATH = '/api/chat';
const USER_ID_STORAGE_KEY = 'travelpal-user-id';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Dify で利用者を区別するためのIDを取得（ブラウザごとに1回だけ作成して使い回す）
let fallbackUserId: string | null = null;
function getUserId(): string {
  try {
    const saved = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (saved) return saved;
    const id = generateId();
    localStorage.setItem(USER_ID_STORAGE_KEY, id);
    return id;
  } catch {
    // プライベートブラウズなどで localStorage が使えない場合
    fallbackUserId ??= generateId();
    return fallbackUserId;
  }
}

class ChatApiError extends Error {
  constructor(
    message: string,
    readonly code?: ChatApiErrorResponse['code'],
  ) {
    super(message);
  }
}

async function postChat(request: ChatApiRequest): Promise<ChatApiResponse> {
  const res = await fetch(CHAT_API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data: unknown = await res.json().catch(() => null);
  if (data === null) {
    // `npm run dev`（Vite単体）で起動すると /api/chat が存在しないためここに来る
    throw new ChatApiError(
      'AIサーバーに接続できませんでした。`npm run dev:netlify` で起動しているか確認してください。',
    );
  }
  if (!res.ok) {
    const { error, code } = data as ChatApiErrorResponse;
    throw new ChatApiError(error || 'チャットの送信に失敗しました', code);
  }
  return data as ChatApiResponse;
}

// Dify と連携するチャットサービスを作成
// 会話の継続に必要な conversation_id はこのサービスの中で保持する
export function createDifyChatService(): ChatService {
  let conversationId = '';

  return {
    async sendMessage(userMessage: string, options: ChatSendOptions): Promise<void> {
      const { onTypingStart, onMessage, onError } = options;

      try {
        onTypingStart?.();

        const send = () =>
          postChat({ query: userMessage, conversation_id: conversationId, user: getUserId() });

        let result: ChatApiResponse;
        try {
          result = await send();
        } catch (err) {
          // 会話IDが無効になっていた場合は、新しい会話として1回だけ送り直す
          if (!(err instanceof ChatApiError) || err.code !== 'conversation_not_found') throw err;
          conversationId = '';
          result = await send();
        }

        conversationId = result.conversation_id;
        onMessage?.(createMessage('assistant', result.answer));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('チャットの送信に失敗しました');
        onError?.(error);
      }
    },
  };
}

// 画面（ChatContainer）が使うデフォルトのチャットサービス
export const defaultChatService: ChatService = createDifyChatService();
