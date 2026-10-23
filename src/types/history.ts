import type { ChatMessage } from '@/types/chat';
import type { TravelConditions } from '@/types/plan';

// 会話履歴（localStorage に保存する単位）の型定義

export interface ChatSession {
  id: string;
  /** 履歴一覧に表示するタイトル（最初の質問から自動で作成） */
  title: string;
  messages: ChatMessage[];
  /** この会話に対応する Dify の会話ID。まだ送信していなければ空文字 */
  conversationId: string;
  /** 最後にフォームで指定した旅行プランの条件（再提案のときに入力欄へ反映する） */
  planConditions?: TravelConditions;
  createdAt: number;
  updatedAt: number;
}

export interface ChatHistoryState {
  sessions: ChatSession[];
  /** 画面に表示中の会話のID */
  activeSessionId: string;
}
