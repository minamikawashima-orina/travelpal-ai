import { useRef, useState, type KeyboardEvent } from 'react';
import { Loader2, SendHorizontal } from 'lucide-react';

interface ChatInputFormProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

// メッセージ入力欄 + 送信ボタン
// Enterキーで送信、Shift+Enterで改行
export function ChatInputForm({ onSend, disabled }: ChatInputFormProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && !disabled;

  function handleSubmit() {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    // 送信後に入力欄の高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // 入力内容に合わせて高さを自動調整（最大5行）
  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-ocean-400 focus-within:ring-2 focus-within:ring-ocean-100"
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="旅のプランを相談してみましょう…"
        rows={1}
        disabled={disabled}
        className="max-h-[140px] min-h-[24px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="メッセージを送信"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
          canSend
            ? 'bg-ocean-600 text-white shadow-sm hover:bg-ocean-700 active:scale-95'
            : 'bg-slate-100 text-slate-300'
        }`}
      >
        {disabled ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
      </button>
    </form>
  );
}
