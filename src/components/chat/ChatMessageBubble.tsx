import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

// 1件のメッセージ表示。ユーザー/AIで見た目を切り替え
export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full gap-2.5 sm:gap-3 animate-slide-up ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm ${
          isUser
            ? 'bg-ocean-600 text-white'
            : 'bg-gradient-to-br from-teal-400 to-ocean-500 text-white'
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div
        className={`flex max-w-[78%] flex-col gap-1 sm:max-w-[70%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <span className="px-1 text-[11px] font-medium text-slate-400">
          {isUser ? 'あなた' : 'TravelPal AI'}
        </span>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-tr-md bg-ocean-600 text-white'
              : 'rounded-tl-md border border-slate-100 bg-white text-slate-700'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
