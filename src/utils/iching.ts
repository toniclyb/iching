import { DivinationMethod } from '../types';
import type { LineValue, HexagramData } from '../types';
import { HEXAGRAM_MAP } from '../constants';

// Helper to get random integer
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate lines using Coin Method probabilities
// 3 Coins tossed:
// Heads (3), Tails (2)
// 3 Heads = 9 (Old Yang) - prob 1/8
// 3 Tails = 6 (Old Yin) - prob 1/8
// 2 Heads 1 Tail = 8 (Young Yin) - prob 3/8
// 1 Head 2 Tails = 7 (Young Yang) - prob 3/8
const castCoinsLine = (): LineValue => {
  const coins = [rand(2, 3), rand(2, 3), rand(2, 3)];
  const sum = coins.reduce((a, b) => a + b, 0);
  return sum as LineValue;
};

// Yarrow Stalk Method (Simplified Probability Simulation)
// Probabilities: 6 (1/16), 7 (5/16), 8 (7/16), 9 (3/16)
const castYarrowLine = (): LineValue => {
  const r = Math.random() * 16;
  if (r < 1) return 6;
  if (r < 6) return 7;
  if (r < 13) return 8;
  return 9;
};

// Random Method (Equal distribution for simple randomness, or weighted slightly)
const castRandomLine = (): LineValue => {
    const r = Math.random();
    if (r < 0.25) return 6;
    if (r < 0.5) return 7;
    if (r < 0.75) return 8;
    return 9;
};

// Plum Blossom (Time based)
// Uses current timestamp to generate a seed
const castPlumLine = (): LineValue => {
    const now = Date.now();
    // Use modulo math to determine lines, ensuring variability
    const val = (now + Math.floor(Math.random() * 1000)) % 4; 
    // Mapping simplified for demo, Plum Blossom usually generates the whole hexagram at once based on numbers.
    // For this simulation to fit the "6 lines" structure:
    const mapping: LineValue[] = [6, 7, 8, 9];
    return mapping[val];
};

export const castHexagram = (method: DivinationMethod): HexagramData => {
  const lines: LineValue[] = [];
  
  for (let i = 0; i < 6; i++) {
    switch (method) {
      case DivinationMethod.COINS:
        lines.push(castCoinsLine());
        break;
      case DivinationMethod.YARROW:
        lines.push(castYarrowLine());
        break;
      case DivinationMethod.PLUM_BLOSSOM:
        lines.push(castPlumLine());
        break;
      case DivinationMethod.RANDOM:
        lines.push(castRandomLine());
        break;
      default:
        lines.push(castCoinsLine());
    }
  }

  // Calculate Original Hexagram (Binary)
  // 6 (Old Yin) -> 0, 7 (Young Yang) -> 1, 8 (Young Yin) -> 0, 9 (Old Yang) -> 1
  const binaryOriginal = lines.map(val => (val % 2 !== 0 ? '1' : '0')).join('');
  
  // Calculate Transformed Hexagram (Binary)
  // 6 -> Changes to 1, 7 -> Stays 1, 8 -> Stays 0, 9 -> Changes to 0
  const binaryTransformed = lines.map(val => {
     if (val === 6) return '1';
     if (val === 9) return '0';
     return val % 2 !== 0 ? '1' : '0';
  }).join('');

  const hasMovingLines = lines.some(l => l === 6 || l === 9);

  return {
    lines,
    originalHexagramIndex: -1, // Not using index, using string map in App
    transformedHexagramIndex: hasMovingLines ? -1 : null,
    hasMovingLines
  };
};

export const getHexagramInfo = (lines: LineValue[]) => {
    // Binary string construction (Bottom to Top)
    const binary = lines.map(val => (val % 2 !== 0 ? '1' : '0')).join('');
    return HEXAGRAM_MAP[binary];
};

export const getTransformedHexagramInfo = (lines: LineValue[]) => {
    const binary = lines.map(val => {
        if (val === 6) return '1';
        if (val === 9) return '0';
        return val % 2 !== 0 ? '1' : '0';
    }).join('');
    return HEXAGRAM_MAP[binary];
};