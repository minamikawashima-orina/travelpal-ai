import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';
import type { ChatHistoryState, ChatSession } from '@/types/history';
import type { TravelConditions } from '@/types/plan';
import { createMessage, createSession, createSessionTitle, hasUserMessage } from '@/utils/chatHelpers';
import { buildPlanRequestMessage, buildPlanRevisionMessage, createPlanTitle } from '@/utils/planHelpers';
import { defaultChatService, type ChatService } from '@/services/chatService';
import { loadChatHistory, saveChatHistory } from '@/services/chatHistoryStorage';
import { ChatMessageBubble } from './ChatMessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ExamplePrompts } from './ExamplePrompts';
import { ChatInputForm } from './ChatInputForm';
import { ChatHeader } from './ChatHeader';
import { ChatHistoryPanel } from './ChatHistoryPanel';
import { PlanConditionsForm } from './PlanConditionsForm';

interface ChatContainerProps {
  // 後から Dify 連携済みのサービスを差し込めるようにしておく
  chatService?: ChatService;
}

// 起動時：保存された履歴があれば復元し、なければ新しい会話から始める
function loadInitialHistory(): ChatHistoryState {
  const saved = loadChatHistory();
  if (saved) {
    if (saved.sessions.some((s) => s.id === saved.activeSessionId)) return saved;
    // 表示中だった会話が見つからなければ、一番新しい会話を表示
    const latest = [...saved.sessions].sort((a, b) => b.updatedAt - a.updatedAt)[0];
    return { sessions: saved.sessions, activeSessionId: latest.id };
  }
  const session = createSession();
  return { sessions: [session], activeSessionId: session.id };
}

// チャット全体の状態管理と送信処理を担うコンテナ
// 画面表示は子コンポーネントに委譲し、ここではチャット処理と会話履歴の管理だけを持つ
export function ChatContainer({ chatService = defaultChatService }: ChatContainerProps) {
  const [history, setHistory] = useState<ChatHistoryState>(loadInitialHistory);
  const [isSending, setIsSending] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession =
    history.sessions.find((s) => s.id === history.activeSessionId) ?? history.sessions[0];
  const messages = activeSession.messages;

  // 会話が変わるたびに localStorage へ自動保存
  useEffect(() => {
    saveChatHistory(history);
  }, [history]);

  // 会話を切り替えたとき（再読み込み直後も含む）は、最新のメッセージが見える位置へ移動
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.activeSessionId]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  // 指定したIDの会話だけを書き換える
  // （返答待ちの間に表示が変わっても、送信元の会話に正しく追加されるようにIDで指定する）
  const updateSession = useCallback((sessionId: string, update: (session: ChatSession) => ChatSession) => {
    setHistory((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) => (s.id === sessionId ? update(s) : s)),
    }));
  }, []);

  const appendMessage = useCallback(
    (sessionId: string, message: ChatMessage, conversationId?: string) => {
      updateSession(sessionId, (s) => ({
        ...s,
        messages: [...s.messages, message],
        conversationId: conversationId ?? s.conversationId,
        updatedAt: Date.now(),
      }));
    },
    [updateSession],
  );

  const handleSend = useCallback(
    async (text: string, plan?: { conditions: TravelConditions; title: string }) => {
      if (isSending) return;

      const sessionId = activeSession.id;
      const userMessage = createMessage('user', text);
      // 先にユーザー発言を履歴に追加（最初の質問なら会話のタイトルにする）
      // 条件フォームから送った場合は、その条件も会話と一緒に保存する
      updateSession(sessionId, (s) => ({
        ...s,
        title: hasUserMessage(s) ? s.title : (plan?.title ?? createSessionTitle(text)),
        messages: [...s.messages, userMessage],
        planConditions: plan?.conditions ?? s.planConditions,
        updatedAt: Date.now(),
      }));

      setIsSending(true);
      try {
        await chatService.sendMessage(text, {
          history: [...activeSession.messages, userMessage],
          // この会話に対応する Dify の会話IDで続きを話す
          conversationId: activeSession.conversationId,
          onTypingStart: scrollToBottom,
          onMessage: (assistantMessage, conversationId) => {
            appendMessage(sessionId, assistantMessage, conversationId);
            scrollToBottom();
          },
          onError: (error) => {
            const errorMessage = createMessage(
              'assistant',
              `申し訳ありません、エラーが発生しました。\n${error.message}`,
            );
            appendMessage(sessionId, errorMessage);
            scrollToBottom();
          },
        });
      } finally {
        setIsSending(false);
        scrollToBottom();
      }
    },
    [activeSession, appendMessage, chatService, isSending, scrollToBottom, updateSession],
  );

  const handleNewChat = useCallback(() => {
    if (isSending) return;
    setHistory((prev) => {
      const current = prev.sessions.find((s) => s.id === prev.activeSessionId);
      // まだ何も質問していない会話を表示中なら、そのまま使う
      if (current && !hasUserMessage(current)) return prev;
      const session = createSession();
      return { sessions: [session, ...prev.sessions], activeSessionId: session.id };
    });
    setIsHistoryOpen(false);
  }, [isSending]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (isSending) return;
      setHistory((prev) => ({
        // 切り替え前の「何も質問していない会話」は不要なので取り除く
        sessions: prev.sessions.filter((s) => s.id === sessionId || hasUserMessage(s)),
        activeSessionId: sessionId,
      }));
      setIsHistoryOpen(false);
    },
    [isSending],
  );

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      if (isSending) return;
      setHistory((prev) => {
        const sessions = prev.sessions.filter((s) => s.id !== sessionId);
        if (sessionId !== prev.activeSessionId) return { ...prev, sessions };
        // 表示中の会話を削除したら、新しい会話に切り替える
        const session = createSession();
        return { sessions: [session, ...sessions], activeSessionId: session.id };
      });
    },
    [isSending],
  );

  const closeHistory = useCallback(() => setIsHistoryOpen(false), []);
  const closePlanForm = useCallback(() => setIsPlanFormOpen(false), []);

  // 条件フォームの送信：初回はプラン作成、前回の条件があれば変更点を添えて再提案を依頼する
  // 送信は通常のチャットと同じ handleSend を通すので、表示・保存・Dify との通信は共通
  const handlePlanSubmit = useCallback(
    (conditions: TravelConditions) => {
      const previous = activeSession.planConditions;
      const text = previous
        ? buildPlanRevisionMessage(previous, conditions)
        : buildPlanRequestMessage(conditions);
      setIsPlanFormOpen(false);
      void handleSend(text, { conditions, title: createPlanTitle(conditions) });
    },
    [activeSession.planConditions, handleSend],
  );

  const showExamples = messages.length <= 1 && !isSending;

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col bg-gradient-to-b from-ocean-50/40 via-white to-white">
      <ChatHeader
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewChat={handleNewChat}
        disabled={isSending}
      />

      <div
        ref={scrollRef}
        className="chat-scroll flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
      >
        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}

        {isSending && <TypingIndicator />}

        {showExamples && (
          <div className="animate-fade-in pt-2">
            <p className="mb-2.5 px-1 text-xs font-medium text-slate-500">
              こんな風に聞いてみるのはいかが?
            </p>
            <ExamplePrompts onSelect={(prompt) => handleSend(prompt)} disabled={isSending} />
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-white/80 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
        <div className="mb-2 flex">
          <button
            type="button"
            onClick={() => setIsPlanFormOpen(true)}
            disabled={isSending}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ocean-200 bg-white px-3.5 text-sm font-medium text-ocean-700 transition hover:border-ocean-400 hover:bg-ocean-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeSession.planConditions ? <RefreshCw size={15} /> : <SlidersHorizontal size={15} />}
            {activeSession.planConditions ? '条件を変更して再提案' : '条件を指定してプラン作成'}
          </button>
        </div>
        <ChatInputForm onSend={handleSend} disabled={isSending} />
        <p className="mt-1.5 text-center text-[11px] text-slate-400">
          Enterで送信 / Shift + Enterで改行
        </p>
      </div>

      <ChatHistoryPanel
        open={isHistoryOpen}
        sessions={history.sessions}
        activeSessionId={activeSession.id}
        disabled={isSending}
        onClose={closeHistory}
        onSelect={handleSelectSession}
        onDelete={handleDeleteSession}
        onNewChat={handleNewChat}
      />

      <PlanConditionsForm
        open={isPlanFormOpen}
        previousConditions={activeSession.planConditions}
        onClose={closePlanForm}
        onSubmit={handlePlanSubmit}
      />
    </div>
  );
}
