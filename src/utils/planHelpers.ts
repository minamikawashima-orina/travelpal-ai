import type { TravelConditions } from '@/types/plan';

// 旅行プランの条件まわりのユーティリティ関数群
// フォームの入力内容を、AIに送るメッセージ（通常のチャットと同じ文章）に変換する

export const DURATION_OPTIONS = ['日帰り', '1泊2日', '2泊3日', '3泊4日', '4泊5日', '5泊以上'] as const;

export const PREFERENCE_OPTIONS = [
  'グルメ',
  '温泉',
  '自然・絶景',
  '歴史・文化',
  'ショッピング',
  'アクティビティ',
  'のんびり',
  '子連れ向け',
] as const;

export const MIN_TRAVELERS = 1;
export const MAX_TRAVELERS = 20;
const MAX_TEXT_LENGTH = 200;

export function createDefaultConditions(): TravelConditions {
  return {
    destination: '',
    duration: '1泊2日',
    budget: '',
    travelers: 2,
    preferences: [],
    note: '',
  };
}

// 前後の空白を取り除き、長すぎる入力を切り詰める
export function normalizeConditions(conditions: TravelConditions): TravelConditions {
  const travelers = Math.round(conditions.travelers);
  return {
    destination: conditions.destination.trim().slice(0, MAX_TEXT_LENGTH),
    duration: conditions.duration,
    budget: conditions.budget.replace(/[^0-9]/g, ''),
    travelers: Number.isFinite(travelers)
      ? Math.min(MAX_TRAVELERS, Math.max(MIN_TRAVELERS, travelers))
      : MIN_TRAVELERS,
    preferences: conditions.preferences,
    note: conditions.note.trim().slice(0, MAX_TEXT_LENGTH),
  };
}

// localStorage から読み込んだ値が正しい形かどうか
export function isTravelConditions(value: unknown): value is TravelConditions {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.destination === 'string' &&
    typeof c.duration === 'string' &&
    typeof c.budget === 'string' &&
    typeof c.travelers === 'number' &&
    Array.isArray(c.preferences) &&
    c.preferences.every((p) => typeof p === 'string') &&
    typeof c.note === 'string'
  );
}

function formatBudget(budget: string): string {
  if (!budget) return '指定なし';
  return `1人あたり${Number(budget).toLocaleString('ja-JP')}円`;
}

// 各条件を「項目名」と「表示する値」の組にする（メッセージ作成と変更点の比較に使う）
function describeConditions(c: TravelConditions): [label: string, value: string][] {
  return [
    ['行き先', c.destination],
    ['日数', c.duration],
    ['予算', formatBudget(c.budget)],
    ['人数', `${c.travelers}人`],
    ['旅行の好み', c.preferences.length > 0 ? c.preferences.join('、') : '指定なし'],
    ['その他の希望', c.note || 'なし'],
  ];
}

function formatConditionList(c: TravelConditions): string {
  return describeConditions(c)
    .map(([label, value]) => `・${label}：${value}`)
    .join('\n');
}

// 初めて条件を指定してプランを依頼するときのメッセージ
export function buildPlanRequestMessage(conditions: TravelConditions): string {
  return [
    '【旅行プランの作成依頼】',
    formatConditionList(conditions),
    '',
    '上記の条件で、日ごとのスケジュール・おすすめスポット・食事・概算費用を含む旅行プランを提案してください。',
  ].join('\n');
}

// 前回の条件を変更して、プランの再提案を依頼するときのメッセージ
export function buildPlanRevisionMessage(previous: TravelConditions, next: TravelConditions): string {
  const before = describeConditions(previous);
  // 値が変わった項目だけを「前 → 後」の形で並べる
  const changeLines = describeConditions(next).flatMap(([label, value], i) =>
    value !== before[i][1] ? [`・${label}：${before[i][1]} → ${value}`] : [],
  );

  return [
    '【条件を変更して再提案】',
    '変更した条件：',
    changeLines.length > 0 ? changeLines.join('\n') : '・変更なし（別の案を出してください）',
    '',
    '変更後の条件：',
    formatConditionList(next),
    '',
    '前回のプランをもとに、変更点を反映した旅行プランを提案し直してください。',
  ].join('\n');
}

// 履歴一覧に表示する会話のタイトル（例：京都 1泊2日の旅行プラン）
export function createPlanTitle(conditions: TravelConditions): string {
  return `${conditions.destination} ${conditions.duration}の旅行プラン`;
}
