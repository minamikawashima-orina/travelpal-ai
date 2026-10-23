import type { PackingCategory, PackingItem } from '@/types/packing';

// 持ち物チェックリストのユーティリティ関数群

// 画面に表示する順番とカテゴリ名
export const PACKING_CATEGORIES: { id: PackingCategory; label: string }[] = [
  { id: 'clothes', label: '衣類' },
  { id: 'toiletries', label: '洗面用具' },
  { id: 'valuables', label: '貴重品' },
  { id: 'electronics', label: '電子機器' },
  { id: 'health', label: '薬・衛生用品' },
  { id: 'other', label: 'その他' },
];

export const MAX_ITEM_NAME_LENGTH = 40;

// 初めて開いたとき（または「初期リストに戻す」を押したとき）の持ち物
const DEFAULT_ITEMS: Record<PackingCategory, string[]> = {
  clothes: ['着替え（日数分）', '下着・靴下', 'パジャマ', '羽織るもの'],
  toiletries: ['歯ブラシ・歯みがき粉', 'タオル', 'スキンケア用品', 'ヘアブラシ'],
  valuables: ['財布・現金', '身分証明書', '健康保険証', '交通機関のチケット'],
  electronics: ['スマートフォン', '充電器・ケーブル', 'モバイルバッテリー'],
  health: ['常備薬', 'マスク', 'ばんそうこう'],
  other: ['エコバッグ', '折りたたみ傘'],
};

let itemCounter = 0;

export function createPackingItem(name: string, category: PackingCategory): PackingItem {
  itemCounter += 1;
  return {
    id: `item-${Date.now()}-${itemCounter}`,
    name: name.trim().slice(0, MAX_ITEM_NAME_LENGTH),
    category,
    checked: false,
  };
}

export function createDefaultPackingList(): PackingItem[] {
  return PACKING_CATEGORIES.flatMap(({ id }) => DEFAULT_ITEMS[id].map((name) => createPackingItem(name, id)));
}

export function isPackingCategory(value: unknown): value is PackingCategory {
  return PACKING_CATEGORIES.some((c) => c.id === value);
}

// 準備済みの数・全体の数・進捗率（%）を計算
export function getPackingProgress(items: PackingItem[]): { checked: number; total: number; percent: number } {
  const total = items.length;
  const checked = items.filter((item) => item.checked).length;
  return { checked, total, percent: total === 0 ? 0 : Math.round((checked / total) * 100) };
}
