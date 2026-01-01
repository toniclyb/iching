import type { HexagramInfo } from './types';

// Simple mapping for 64 hexagrams. 
// Key: Binary string (Bottom to Top), 1=Yang, 0=Yin.
// This allows us to instantly identify the hexagram before asking AI for details.
export const HEXAGRAM_MAP: Record<string, HexagramInfo> = {
  "111111": { binary: "111111", name: "The Creative", nameZh: "乾为天" },
  "000000": { binary: "000000", name: "The Receptive", nameZh: "坤为地" },
  "100010": { binary: "100010", name: "Difficulty at the Beginning", nameZh: "水雷屯" },
  "010001": { binary: "010001", name: "Youthful Folly", nameZh: "山水蒙" },
  "111010": { binary: "111010", name: "Waiting", nameZh: "水天需" },
  "010111": { binary: "010111", name: "Conflict", nameZh: "天水讼" },
  "010000": { binary: "010000", name: "The Army", nameZh: "地水师" },
  "000010": { binary: "000010", name: "Holding Together", nameZh: "水地比" },
  "111011": { binary: "111011", name: "Taming Power of the Small", nameZh: "风天小畜" },
  "110111": { binary: "110111", name: "Treading", nameZh: "天泽履" },
  "111000": { binary: "111000", name: "Peace", nameZh: "地天泰" },
  "000111": { binary: "000111", name: "Standstill", nameZh: "天地否" },
  "101111": { binary: "101111", name: "Fellowship with Men", nameZh: "天火同人" },
  "111101": { binary: "111101", name: "Possession in Great Measure", nameZh: "火天大有" },
  "001000": { binary: "001000", name: "Modesty", nameZh: "地山谦" },
  "000100": { binary: "000100", name: "Enthusiasm", nameZh: "雷地豫" },
  "100110": { binary: "100110", name: "Following", nameZh: "泽雷随" },
  "011001": { binary: "011001", name: "Work on What Has Been Spoiled", nameZh: "山风蛊" },
  "110000": { binary: "110000", name: "Approach", nameZh: "地泽临" },
  "000011": { binary: "000011", name: "Contemplation", nameZh: "风地观" },
  "100101": { binary: "100101", name: "Biting Through", nameZh: "火雷噬嗑" },
  "101001": { binary: "101001", name: "Grace", nameZh: "山火贲" },
  "000001": { binary: "000001", name: "Splitting Apart", nameZh: "山地剥" },
  "100000": { binary: "100000", name: "Return", nameZh: "地雷复" },
  "100111": { binary: "100111", name: "Innocence", nameZh: "天雷无妄" },
  "111001": { binary: "111001", name: "Great Taming Power", nameZh: "山天大畜" },
  "100001": { binary: "100001", name: "Mouth Corners", nameZh: "山雷颐" },
  "011110": { binary: "011110", name: "Preponderance of the Great", nameZh: "泽风大过" },
  "010010": { binary: "010010", name: "The Abysmal", nameZh: "坎为水" },
  "101101": { binary: "101101", name: "The Clinging", nameZh: "离为火" },
  "001110": { binary: "001110", name: "Influence", nameZh: "泽山咸" },
  "011100": { binary: "011100", name: "Duration", nameZh: "雷风恒" },
  "001111": { binary: "001111", name: "Retreat", nameZh: "天山遁" },
  "111100": { binary: "111100", name: "The Power of the Great", nameZh: "雷天大壮" },
  "000101": { binary: "000101", name: "Progress", nameZh: "火地晋" },
  "101000": { binary: "101000", name: "Darkening of the Light", nameZh: "地火明夷" },
  "101010": { binary: "101010", name: "The Family", nameZh: "风火家人" },
  "010101": { binary: "010101", name: "Opposition", nameZh: "火泽睽" },
  "001010": { binary: "001010", name: "Obstruction", nameZh: "水山蹇" },
  "010100": { binary: "010100", name: "Deliverance", nameZh: "雷水解" },
  "110001": { binary: "110001", name: "Decrease", nameZh: "山泽损" },
  "100011": { binary: "100011", name: "Increase", nameZh: "风雷益" },
  "111110": { binary: "111110", name: "Breakthrough", nameZh: "泽天夬" },
  "011111": { binary: "011111", name: "Coming to Meet", nameZh: "天风姤" },
  "000110": { binary: "000110", name: "Gathering Together", nameZh: "泽地萃" },
  "011000": { binary: "011000", name: "Pushing Upward", nameZh: "地风升" },
  "010110": { binary: "010110", name: "Oppression", nameZh: "泽水困" },
  "011010": { binary: "011010", name: "The Well", nameZh: "水风井" },
  "101110": { binary: "101110", name: "Revolution", nameZh: "泽火革" },
  "011101": { binary: "011101", name: "The Cauldron", nameZh: "火风鼎" },
  "100100": { binary: "100100", name: "The Arousing", nameZh: "震为雷" },
  "001001": { binary: "001001", name: "The Keeping Still", nameZh: "艮为山" },
  "001011": { binary: "001011", name: "Development", nameZh: "风山渐" },
  "110100": { binary: "110100", name: "The Marrying Maiden", nameZh: "雷泽归妹" },
  "101100": { binary: "101100", name: "Abundance", nameZh: "雷火丰" },
  "001101": { binary: "001101", name: "The Wanderer", nameZh: "火山旅" },
  "011011": { binary: "011011", name: "The Gentle", nameZh: "巽为风" },
  "110110": { binary: "110110", name: "The Joyous", nameZh: "兑为泽" },
  "010011": { binary: "010011", name: "Dispersion", nameZh: "风水涣" },
  "110010": { binary: "110010", name: "Limitation", nameZh: "水泽节" },
  "110011": { binary: "110011", name: "Inner Truth", nameZh: "风泽中孚" },
  "001100": { binary: "001100", name: "Preponderance of the Small", nameZh: "雷山小过" },
  "101011": { binary: "101011", name: "After Completion", nameZh: "水火既济" },
  "110101": { binary: "110101", name: "Before Completion", nameZh: "火水未济" },
};

export const COMMON_CATEGORIES = [
  "气运",
  "财运",
  "事业",
  "家宅",
  "健康",
  "感情",
  "学业"
];

// 背景音量 (0.0 到 1.0)
export const DEFAULT_VOLUME = 0.05;

// 背景音乐 - 本地文件
export const BG_MUSIC_URL = "/bgm.aac";