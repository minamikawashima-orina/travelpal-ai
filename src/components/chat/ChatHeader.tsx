import { Compass, Sparkles } from 'lucide-react';

// アプリのヘッダー部分
export function ChatHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-ocean-100/60 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-teal-500 text-white shadow-sm">
          <Compass size={22} />
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold text-slate-800 sm:text-lg">TravelPal AI</h1>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-600">
              <Sparkles size={11} />
              旅行プランナー
            </span>
          </div>
          <p className="text-xs text-slate-500">AIと一緒に旅のプランを相談しよう</p>
        </div>
        <div className="ml-auto hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          オンライン
        </div>
      </div>
    </header>
  );
}
