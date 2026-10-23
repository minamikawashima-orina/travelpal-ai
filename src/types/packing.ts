// 旅行の持ち物チェックリストの型定義

export type PackingCategory = 'clothes' | 'toiletries' | 'valuables' | 'electronics' | 'health' | 'other';

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory;
  /** 準備済みならtrue */
  checked: boolean;
}
