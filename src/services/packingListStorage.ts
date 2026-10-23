import type { PackingItem } from '@/types/packing';
import { isPackingCategory } from '@/utils/packingHelpers';

// 持ち物チェックリストを localStorage に保存・復元する処理
//
// 会話履歴とは別のキーに保存するので、お互いのデータに影響しない。
// プライベートブラウズや容量不足で保存できなくても、チェックリスト自体は使えるようにしている。

// データの形を変えるときは v2 などに上げ、古いデータで画面が壊れないようにする
const STORAGE_KEY = 'travelpal-packing-list-v1';
const STORAGE_VERSION = 1;

interface StoredPackingList {
  version: typeof STORAGE_VERSION;
  items: PackingItem[];
}

function isPackingItem(value: unknown): value is PackingItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    isPackingCategory(item.category) &&
    typeof item.checked === 'boolean'
  );
}

// 保存済みのリストを読み込む。一度も保存していない・壊れていれば null
// （すべて削除して空になったリストは、空のまま復元する）
export function loadPackingList(): PackingItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as Partial<StoredPackingList> | null;
    if (data?.version !== STORAGE_VERSION || !Array.isArray(data.items)) return null;

    // 形の正しくない持ち物だけを取り除き、残りは復元する
    return data.items.filter(isPackingItem);
  } catch {
    return null;
  }
}

export function savePackingList(items: PackingItem[]): void {
  const data: StoredPackingList = { version: STORAGE_VERSION, items };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('持ち物リストを保存できませんでした', err);
  }
}
