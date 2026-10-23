import { useEffect } from 'react';
import { History, MessageSquare, SquarePen, Trash2, X } from 'lucide-react';
import type { ChatSession } from '@/types/history';
import { hasUserMessage } from '@/utils/chatHelpers';

interface ChatHistoryPanelProps {
  open: boolean;
  sessions: ChatSession[];
  activeSessionId: string;
  /** AIの返答待ちの間は、会話の切り替えや削除をできなくする */
  disabled?: boolean;
  onClose: () => void;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onNewChat: () => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 保存された会話の一覧（画面の右側から表示するパネル）
export function ChatHistoryPanel({
  open,
  sessions,
  activeSessionId,
  disabled,
  onClose,
  onSelect,
  onDelete,
  onNewChat,
}: ChatHistoryPanelProps) {
  // Escキーで閉じる
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  // 質問したことのある会話だけを、新しい順に表示
  const visibleSessions = sessions
    .filter(hasUserMessage)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  function handleDelete(session: ChatSession) {
    if (window.confirm(`「${session.title}」を履歴から削除しますか?`)) {
      onDelete(session.id);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end" role="dialog" aria-modal="true" aria-label="会話履歴">
      <button
        type="button"
        aria-label="履歴を閉じる"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-[2px]"
      />

      <aside className="relative flex h-full w-full max-w-sm animate-fade-in flex-col bg-white shadow-xl">
        <div className="flex items-center gap-2 border-b border-ocean-100/60 px-4 py-3">
          <History size={18} className="text-ocean-600" />
          <h2 className="text-base font-bold text-slate-800">会話履歴</h2>
          <span className="rounded-full bg-ocean-50 px-2 py-0.5 text-[11px] font-semibold text-ocean-600">
            {visibleSessions.length}件
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="履歴を閉じる"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3">
          <button
            type="button"
            onClick={onNewChat}
            disabled={disabled}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-ocean-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SquarePen size={16} />
            新しい会話を始める
          </button>
          {disabled && (
            <p className="mt-2 text-center text-[11px] text-slate-400">
              AIの返答が終わると、会話を切り替えられます
            </p>
          )}
        </div>

        <div className="chat-scroll flex-1 overflow-y-auto px-3 pb-3">
          {visibleSessions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <MessageSquare size={28} className="text-ocean-200" />
              <p className="text-sm text-slate-500">まだ保存された会話はありません</p>
              <p className="text-xs text-slate-400">AIに旅の相談をすると、ここに自動で保存されます</p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {visibleSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <li
                    key={session.id}
                    className={`group flex items-stretch rounded-xl border transition ${
                      isActive
                        ? 'border-ocean-200 bg-ocean-50/70'
                        : 'border-transparent hover:border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(session.id)}
                      disabled={disabled}
                      aria-current={isActive ? 'true' : undefined}
                      className="flex min-w-0 flex-1 flex-col gap-0.5 px-3 py-2.5 text-left disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span
                        className={`truncate text-sm font-medium ${isActive ? 'text-ocean-700' : 'text-slate-700'}`}
                      >
                        {session.title}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(session.updatedAt)}・{session.messages.length}件のメッセージ
                        {isActive && <span className="ml-1.5 font-semibold text-ocean-600">表示中</span>}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(session)}
                      disabled={disabled}
                      aria-label={`「${session.title}」を削除`}
                      className="flex w-11 shrink-0 items-center justify-center rounded-r-xl text-slate-300 transition hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="border-t border-slate-100 px-4 py-2.5 text-center text-[11px] text-slate-400">
          履歴はこのブラウザにだけ保存されます
        </p>
      </aside>
    </div>
  );
}
