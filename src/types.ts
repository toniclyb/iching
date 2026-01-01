export enum DivinationMethod {
  YARROW = 'yarrow', // 蓍草
  COINS = 'coins',   // 铜钱
  PLUM_BLOSSOM = 'plum', // 梅花易数
  RANDOM = 'random'  // 随机
}

// 6 = Old Yin (Changing), 7 = Young Yang (Static), 8 = Young Yin (Static), 9 = Old Yang (Changing)
export type LineValue = 6 | 7 | 8 | 9;

export interface HexagramData {
  lines: LineValue[]; // Bottom to Top (index 0 is bottom line)
  originalHexagramIndex: number; // 0-63
  transformedHexagramIndex: number | null; // 0-63 or null if no moving lines
  hasMovingLines: boolean;
}

export enum AppState {
  HOME = 'HOME',
  ANIMATING = 'ANIMATING',
  RESULT_VIEW = 'RESULT_VIEW', // Viewing the hexagram details
  INTERPRETATION_INPUT = 'INTERPRETATION_INPUT', // Choosing category
  INTERPRETATION_LOADING = 'INTERPRETATION_LOADING',
  FINAL_RESULT = 'FINAL_RESULT'
}

export interface InterpretationRequest {
  category: string;
  query: string;
}

export interface HexagramInfo {
  binary: string; // "111111" (Top to Bottom or Bottom to Top depending on convention, we use Bottom to Top here for array mapping)
  name: string;
  nameZh: string;
}

export interface GeminiResponse {
  originalText: string; // The classical text (Gua Ci)
  explanation: string; // General explanation of the hexagram
  movingLinesExplanation?: string; // Explanation of moving lines if any
}

export interface InterpretationResult {
  coreInterpretation: string; // 核心解读
  verse: string; // 四句偈言
  details: string; // 补充说明
}
