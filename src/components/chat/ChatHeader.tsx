import { Compass, History, Sparkles, SquarePen } from 'lucide-react';

interface ChatHeaderProps {
  onOpenHistory: () => void;
  onNewChat: () => void;
  /** AIの返答待ちの間は「新しい会話」を押せないようにする */
  disabled?: boolean;
}

const actionButtonClass =
  'inline-flex h-9 items-center gap-1.5 rounded-lg border border-ocean-100 bg-white px-2.5 text-xs font-medium text-ocean-700 transition hover:border-ocean-300 hover:bg-ocean-50 disabled:cursor-not-allowed disabled:opacity-50';

// アプリのヘッダー部分
export function ChatHeader({ onOpenHistory, onNewChat, disabled }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-ocean-100/60 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-teal-500 text-white shadow-sm">
          <Compass size={22} />
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold text-slate-800 sm:text-lg">TravelPal AI</h1>
            <span className="hidden items-center gap-0.5 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-600 min-[400px]:inline-flex">
              <Sparkles size={11} />
              旅行プランナー
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">AIと一緒に旅のプランを相談しよう</p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <div className="mr-1 hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            オンライン
          </div>
          <button type="button" onClick={onOpenHistory} aria-label="会話履歴を開く" className={actionButtonClass}>
            <History size={16} />
            <span className="hidden sm:inline">履歴</span>
          </button>
          <button
            type="button"
            onClick={onNewChat}
            disabled={disabled}
            aria-label="新しい会話を始める"
            className={actionButtonClass}
          >
            <SquarePen size={16} />
            <span className="hidden sm:inline">新しい会話</span>
          </button>
        </div>
      </div>
    </header>
  );
}
