import { useEffect, useState, type FormEvent } from 'react';
import { Minus, Plus, RefreshCw, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { TravelConditions } from '@/types/plan';
import {
  DURATION_OPTIONS,
  MAX_TRAVELERS,
  MIN_TRAVELERS,
  PREFERENCE_OPTIONS,
  createDefaultConditions,
  normalizeConditions,
} from '@/utils/planHelpers';

interface PlanConditionsFormProps {
  open: boolean;
  /** 前回の条件。あれば「条件を変更して再提案」として表示し、入力欄に反映する */
  previousConditions?: TravelConditions;
  onClose: () => void;
  onSubmit: (conditions: TravelConditions) => void;
}

const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';
// スマートフォンで入力時に画面が拡大されないよう、文字サイズは16px（text-base）にする
const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100';

function chipClass(selected: boolean): string {
  return `rounded-full border px-3 py-2 text-sm font-medium transition ${
    selected
      ? 'border-ocean-500 bg-ocean-600 text-white shadow-sm'
      : 'border-ocean-100 bg-white text-ocean-700 hover:border-ocean-300 hover:bg-ocean-50'
  }`;
}

// 旅行プランの条件入力フォーム（スマートフォンでは画面下から、PCでは中央に表示）
export function PlanConditionsForm({ open, previousConditions, onClose, onSubmit }: PlanConditionsFormProps) {
  const [conditions, setConditions] = useState<TravelConditions>(createDefaultConditions);
  const [error, setError] = useState('');
  const isRevision = Boolean(previousConditions);

  // 開くたびに、前回の条件（なければ初期値）を入力欄に反映
  useEffect(() => {
    if (!open) return;
    setConditions(previousConditions ?? createDefaultConditions());
    setError('');
  }, [open, previousConditions]);

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

  function update<K extends keyof TravelConditions>(key: K, value: TravelConditions[K]) {
    setConditions((prev) => ({ ...prev, [key]: value }));
  }

  function togglePreference(preference: string) {
    setConditions((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter((p) => p !== preference)
        : [...prev.preferences, preference],
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizeConditions(conditions);
    if (!normalized.destination) {
      setError('行き先を入力してください');
      return;
    }
    onSubmit(normalized);
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isRevision ? '条件を変更して再提案' : '条件を指定してプランを作成'}
    >
      <button
        type="button"
        aria-label="フォームを閉じる"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-[2px]"
      />

      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[90dvh] w-full max-w-lg animate-slide-up flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center gap-2 border-b border-ocean-100/60 px-4 py-3">
          <SlidersHorizontal size={18} className="text-ocean-600" />
          <h2 className="text-base font-bold text-slate-800">
            {isRevision ? '条件を変更して再提案' : '条件を指定してプランを作成'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="フォームを閉じる"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="chat-scroll flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {isRevision && (
            <p className="rounded-xl bg-ocean-50 px-3 py-2 text-xs leading-relaxed text-ocean-700">
              前回の条件が入力されています。変えたい項目だけ直して送信してください。
            </p>
          )}

          <div>
            <label htmlFor="plan-destination" className={labelClass}>
              行き先 <span className="text-error-500">*</span>
            </label>
            <input
              id="plan-destination"
              type="text"
              value={conditions.destination}
              onChange={(e) => {
                update('destination', e.target.value);
                setError('');
              }}
              placeholder="例：京都、北海道、沖縄"
              maxLength={200}
              aria-invalid={Boolean(error)}
              className={inputClass}
            />
            {error && <p className="mt-1.5 text-xs text-error-600">{error}</p>}
          </div>

          <div>
            <span className={labelClass}>旅行日数</span>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update('duration', option)}
                  aria-pressed={conditions.duration === option}
                  className={chipClass(conditions.duration === option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 min-[400px]:grid-cols-2">
            <div>
              <label htmlFor="plan-budget" className={labelClass}>
                予算（1人あたり）
              </label>
              <div className="relative">
                <input
                  id="plan-budget"
                  type="text"
                  inputMode="numeric"
                  value={conditions.budget}
                  onChange={(e) => update('budget', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="例：50000"
                  className={`${inputClass} pr-9`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  円
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">空欄なら「指定なし」で送信します</p>
            </div>

            <div>
              <span className={labelClass}>人数</span>
              <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-1">
                <button
                  type="button"
                  onClick={() => update('travelers', Math.max(MIN_TRAVELERS, conditions.travelers - 1))}
                  disabled={conditions.travelers <= MIN_TRAVELERS}
                  aria-label="人数を減らす"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ocean-600 transition hover:bg-ocean-50 disabled:text-slate-300"
                >
                  <Minus size={16} />
                </button>
                <span className="text-base font-semibold text-slate-700" aria-live="polite">
                  {conditions.travelers}人
                </span>
                <button
                  type="button"
                  onClick={() => update('travelers', Math.min(MAX_TRAVELERS, conditions.travelers + 1))}
                  disabled={conditions.travelers >= MAX_TRAVELERS}
                  aria-label="人数を増やす"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ocean-600 transition hover:bg-ocean-50 disabled:text-slate-300"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <span className={labelClass}>旅行の好み（複数選択可）</span>
            <div className="flex flex-wrap gap-2">
              {PREFERENCE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => togglePreference(option)}
                  aria-pressed={conditions.preferences.includes(option)}
                  className={chipClass(conditions.preferences.includes(option))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="plan-note" className={labelClass}>
              その他の希望
            </label>
            <textarea
              id="plan-note"
              value={conditions.note}
              onChange={(e) => update('note', e.target.value)}
              placeholder="例：移動は電車中心、朝はゆっくりしたい"
              maxLength={200}
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ocean-600 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean-700 active:scale-[0.98]"
          >
            {isRevision ? <RefreshCw size={16} /> : <Sparkles size={16} />}
            {isRevision ? 'この条件で再提案してもらう' : 'この条件でプランを作成'}
          </button>
        </div>
      </form>
    </div>
  );
}
