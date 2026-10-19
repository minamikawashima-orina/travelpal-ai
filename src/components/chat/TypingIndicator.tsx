// AIが返答を準備中のときに表示するタイピングインジケーター
export function TypingIndicator() {
  return (
    <div className="flex w-full gap-2.5 sm:gap-3 animate-fade-in" aria-live="polite">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-ocean-500 text-white shadow-sm"
        aria-hidden="true"
      >
        <span className="text-sm font-bold">AI</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-slate-100 bg-white px-4 py-4 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-ocean-400 animate-typing-bounce" />
        <span
          className="h-2 w-2 rounded-full bg-ocean-400 animate-typing-bounce"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-ocean-400 animate-typing-bounce"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
    </div>
  );
}
