import { useEffect, useState, type FormEvent } from 'react';
import { Check, ListChecks, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import type { PackingCategory, PackingItem } from '@/types/packing';
import {
  MAX_ITEM_NAME_LENGTH,
  PACKING_CATEGORIES,
  createDefaultPackingList,
  createPackingItem,
  getPackingProgress,
} from '@/utils/packingHelpers';
import { loadPackingList, savePackingList } from '@/services/packingListStorage';

interface PackingListPanelProps {
  open: boolean;
  onClose: () => void;
}

// スマートフォンで入力時に画面が拡大されないよう、文字サイズは16px（text-base）にする
const fieldClass =
  'h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100';

// 旅行の持ち物チェックリスト（画面の右側から表示するパネル）
// パネルを閉じても状態が消えないよう、このコンポーネントは常に配置しておき、表示だけを切り替える
export function PackingListPanel({ open, onClose }: PackingListPanelProps) {
  const [items, setItems] = useState<PackingItem[]>(() => loadPackingList() ?? createDefaultPackingList());
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<PackingCategory>('clothes');

  // チェックや追加・削除のたびに localStorage へ自動保存
  useEffect(() => {
    savePackingList(items);
  }, [items]);

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

  const progress = getPackingProgress(items);
  const isComplete = progress.total > 0 && progress.checked === progress.total;

  function toggleItem(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setItems((prev) => [...prev, createPackingItem(newName, newCategory)]);
    setNewName('');
  }

  function handleUncheckAll() {
    if (window.confirm('すべてのチェックを外しますか?（持ち物は削除されません）')) {
      setItems((prev) => prev.map((item) => ({ ...item, checked: false })));
    }
  }

  function handleResetList() {
    if (window.confirm('追加・削除した内容を取り消して、初期の持ち物リストに戻しますか?')) {
      setItems(createDefaultPackingList());
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end" role="dialog" aria-modal="true" aria-label="持ち物チェックリスト">
      <button
        type="button"
        aria-label="持ち物リストを閉じる"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-slate-900/30 backdrop-blur-[2px]"
      />

      <aside className="relative flex h-full w-full max-w-md animate-fade-in flex-col bg-white shadow-xl">
        <div className="flex items-center gap-2 border-b border-ocean-100/60 px-4 py-3">
          <ListChecks size={18} className="text-ocean-600" />
          <h2 className="text-base font-bold text-slate-800">持ち物チェックリスト</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="持ち物リストを閉じる"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* 進捗 */}
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="text-sm text-slate-600">
              準備済み{' '}
              <span className="text-lg font-bold text-ocean-700">{progress.checked}</span>
              <span className="text-slate-400"> / {progress.total}件</span>
            </p>
            <p className={`text-sm font-bold ${isComplete ? 'text-success-600' : 'text-ocean-600'}`}>
              {progress.percent}%
            </p>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            aria-label="準備の進捗"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete ? 'bg-success-500' : 'bg-gradient-to-r from-ocean-500 to-teal-500'
              }`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          {isComplete && (
            <p className="mt-1.5 text-xs font-medium text-success-600">準備完了!楽しい旅を🎒</p>
          )}
        </div>

        {/* カテゴリ別の持ち物 */}
        <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-3 py-3">
          {PACKING_CATEGORIES.map((category) => {
            const categoryItems = items.filter((item) => item.category === category.id);
            if (categoryItems.length === 0) return null;
            const categoryProgress = getPackingProgress(categoryItems);
            return (
              <section key={category.id} aria-label={category.label}>
                <div className="mb-1 flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-slate-700">{category.label}</h3>
                  <span className="text-[11px] font-medium text-slate-400">
                    {categoryProgress.checked} / {categoryProgress.total}
                  </span>
                </div>
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
                  {categoryItems.map((item) => (
                    <li key={item.id} className="flex items-stretch">
                      <label className="flex min-h-[48px] min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item.id)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-ocean-200 ${
                            item.checked ? 'border-ocean-600 bg-ocean-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {item.checked && <Check size={15} strokeWidth={3} />}
                        </span>
                        <span
                          className={`break-words text-[15px] ${
                            item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
                          }`}
                        >
                          {item.name}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        aria-label={`「${item.name}」を削除`}
                        className="flex w-11 shrink-0 items-center justify-center text-slate-300 transition hover:text-error-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          {items.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              持ち物がありません。下の入力欄から追加してください。
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleUncheckAll}
              disabled={progress.checked === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={14} />
              チェックをすべて外す
            </button>
            <button
              type="button"
              onClick={handleResetList}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
            >
              <RotateCcw size={14} />
              初期リストに戻す
            </button>
          </div>
        </div>

        {/* 持ち物の追加 */}
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] min-[400px]:flex-row"
        >
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as PackingCategory)}
            aria-label="追加するカテゴリ"
            className={`${fieldClass} min-[400px]:w-32`}
          >
            {PACKING_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="持ち物を追加"
              maxLength={MAX_ITEM_NAME_LENGTH}
              aria-label="追加する持ち物の名前"
              className={`${fieldClass} min-w-0 flex-1`}
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              aria-label="持ち物を追加"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-600 text-white shadow-sm transition hover:bg-ocean-700 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
            >
              <Plus size={18} />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
