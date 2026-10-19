import { useCallback, useRef, useState } from 'react';
import type { ChatMessage } from '@/types/chat';
import { createMessage, createWelcomeMessage } from '@/utils/chatHelpers';
import { defaultChatService, type ChatService } from '@/services/chatService';
import { ChatMessageBubble } from './ChatMessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ExamplePrompts } from './ExamplePrompts';
import { ChatInputForm } from './ChatInputForm';
import { ChatHeader } from './ChatHeader';

interface ChatContainerProps {
  // 後から Dify 連携済みのサービスを差し込めるようにしておく
  chatService?: ChatService;
}

// チャット全体の状態管理と送信処理を担うコンテナ
// 画面表示は子コンポーネントに委譲し、ここではチャット処理だけを持つ
export function ChatContainer({ chatService = defaultChatService }: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage()]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (isSending) return;

      const userMessage = createMessage('user', text);
      // 先にユーザー発言を履歴に追加
      setMessages((prev) => [...prev, userMessage]);

      setIsSending(true);
      try {
        await chatService.sendMessage(text, {
          history: [...messages, userMessage],
          onTypingStart: scrollToBottom,
          onMessage: (assistantMessage) => {
            setMessages((prev) => [...prev, assistantMessage]);
            scrollToBottom();
          },
          onError: (error) => {
            const errorMessage = createMessage(
              'assistant',
              `申し訳ありません、エラーが発生しました。\n${error.message}`,
            );
            setMessages((prev) => [...prev, errorMessage]);
            scrollToBottom();
          },
        });
      } finally {
        setIsSending(false);
        scrollToBottom();
      }
    },
    [chatService, isSending, messages, scrollToBottom],
  );

  const showExamples = messages.length <= 1 && !isSending;

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col bg-gradient-to-b from-ocean-50/40 via-white to-white">
      <ChatHeader />

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
            <ExamplePrompts onSelect={handleSend} disabled={isSending} />
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-white/80 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
        <ChatInputForm onSend={handleSend} disabled={isSending} />
        <p className="mt-1.5 text-center text-[11px] text-slate-400">
          Enterで送信 / Shift + Enterで改行
        </p>
      </div>
    </div>
  );
}
