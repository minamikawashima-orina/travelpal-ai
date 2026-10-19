// チャット機能に関わる共通の型定義
// Dify API連携時もこの型をベースに拡張してください

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface ChatSendOptions {
  /** 直近の会話履歴（AI側のコンテキストとして利用） */
  history: ChatMessage[];
  /** 送信中フラグを切り替えるためのコールバック */
  onTypingStart?: () => void;
  /** AI応答の受信時に呼ばれるコールバック */
  onMessage?: (message: ChatMessage) => void;
  /** エラー発生時に呼ばれるコールバック */
  onError?: (error: Error) => void;
}

// ブラウザ ⇔ Netlify Functions（/api/chat）間でやり取りするデータ
// APIキーは含めず、サーバー側（netlify/functions/chat.ts）で付与する
export interface ChatApiRequest {
  query: string;
  /** Dify の会話ID。初回は空文字 */
  conversation_id: string;
  /** Dify で利用者を区別するためのID */
  user: string;
}

export interface ChatApiResponse {
  answer: string;
  conversation_id: string;
}

export interface ChatApiErrorResponse {
  error: string;
  code?: 'conversation_not_found';
}
