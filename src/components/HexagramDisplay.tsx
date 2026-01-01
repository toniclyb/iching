import React from 'react';
import type { LineValue, HexagramInfo } from '../types';

interface Props {
  lines: LineValue[];
  info?: HexagramInfo;
  isTransformed?: boolean;
  small?: boolean;
}

const HexagramDisplay: React.FC<Props> = ({ lines, info, isTransformed = false, small = false }) => {
  // Render lines from Top (index 5) to Bottom (index 0) visually
  const renderOrder = [5, 4, 3, 2, 1, 0];

  if (small) {
    // 小尺寸版本 - 仅显示卦象图形
    return (
      <div className="flex flex-col items-center gap-1">
        {renderOrder.map((lineIndex) => {
          const val = lines[lineIndex];
          const isYang = val % 2 !== 0; // 7, 9 are Yang

          return (
            <div key={lineIndex} className="w-16 h-1.5 flex justify-center">
              {isYang ? (
                <div className="w-full h-full bg-amber-400 rounded-sm" />
              ) : (
                <div className="w-full h-full flex justify-between">
                  <div className="w-[40%] h-full bg-amber-400 rounded-sm" />
                  <div className="w-[40%] h-full bg-amber-400 rounded-sm" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-slate-900/80 border border-amber-900/50 rounded-lg shadow-2xl backdrop-blur-sm max-w-sm w-full mx-auto transform transition-all hover:scale-105 duration-500">
      {info && (
        <h3 className="text-2xl font-bold text-amber-500 mb-4 font-serif tracking-widest">
          {info.nameZh} <span className="text-sm text-amber-700 block mt-1">{info.name}</span>
        </h3>
      )}

      <div className="space-y-3 w-full px-8">
        {renderOrder.map((lineIndex) => {
          const val = lines[lineIndex];
          let isYang = false;
          let isMoving = false;

          if (isTransformed) {
            isYang = (val === 6 || val === 7 || (val % 2 !== 0 && val > 9));
            if (!isTransformed && (val === 6 || val === 9)) isMoving = true;
          } else {
            isYang = val % 2 !== 0;
            if (val === 6 || val === 9) isMoving = true;
          }

          return (
            <div key={lineIndex} className="relative h-4 w-full flex items-center justify-center">
              <div className="absolute left-[-20px] text-xs text-slate-500">{lineIndex + 1}</div>

              {isYang ? (
                <div className="w-full h-full bg-amber-400 rounded shadow-[0_0_10px_rgba(251,191,36,0.5)] relative flex justify-center items-center">
                  {isMoving && !isTransformed && <div className="w-3 h-3 rounded-full border-2 border-slate-900 bg-transparent animate-pulse"></div>}
                </div>
              ) : (
                <div className="w-full h-full flex justify-between">
                  <div className="w-[42%] h-full bg-amber-400 rounded shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
                  <div className="w-[42%] h-full bg-amber-400 rounded shadow-[0_0_10px_rgba(251,191,36,0.5)] flex justify-center items-center"></div>
                  {isMoving && !isTransformed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-amber-200 text-lg font-bold">✕</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-slate-400 tracking-widest opacity-70">
        {isTransformed ? "变卦" : "本卦"}
      </div>
    </div>
  );
};

export default HexagramDisplay;