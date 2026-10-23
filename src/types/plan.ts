// 旅行プランの条件（条件入力フォームの内容）の型定義

export interface TravelConditions {
  /** 行き先（例：京都） */
  destination: string;
  /** 旅行日数（例：1泊2日） */
  duration: string;
  /** 1人あたりの予算（円）。空文字なら指定なし */
  budget: string;
  /** 人数 */
  travelers: number;
  /** 旅行の好み（グルメ・温泉など、複数選択） */
  preferences: string[];
  /** その他の希望（自由入力） */
  note: string;
}
