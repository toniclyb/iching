import React, { useState, useEffect } from 'react';
import { DivinationMethod } from '../types';

interface AnimationProps {
    animStep: number;
}

/**
 * 铜钱法动画 - 三枚钱币翻转
 */
export const CoinsAnimation: React.FC<AnimationProps> = ({ animStep }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-10">
            <div className="flex space-x-6">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-16 h-16 rounded-full border-4 border-amber-600 bg-amber-900/40 relative animate-bounce shadow-glow"
                        style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }}
                    >
                        {/* 钱币方孔 */}
                        <div className="absolute inset-0 m-auto w-5 h-5 border-2 border-amber-600/50 bg-transparent rotate-45" />
                        {/* 装饰线条 */}
                        <div className="absolute inset-2 border border-amber-600/30 rounded-full" />
                    </div>
                ))}
            </div>
            <div className="text-amber-500/60 text-sm font-serif">
                掷钱第 <span className="text-amber-400 text-lg">{Math.min(animStep + 1, 6)}</span> 爻
            </div>
        </div>
    );
};

/**
 * 蓍草法动画 - 草棍分流与排列
 */
export const YarrowAnimation: React.FC<AnimationProps> = ({ animStep }) => {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <div className="relative w-64 h-40 flex items-center justify-center">
                {/* 左路蓍草 */}
                <div className="flex space-x-1 rotate-[-15deg] transition-all duration-500">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-1 h-24 bg-amber-800/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                </div>
                {/* 右路蓍草 */}
                <div className="flex space-x-1 rotate-[15deg] transition-all duration-500 translate-x-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-1 h-24 bg-amber-800/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                </div>
                {/* 悬挂蓍草 */}
                <div className="absolute top-0 w-1 h-20 bg-amber-500 rounded-full animate-bounce shadow-glow" />
            </div>
            <div className="text-amber-500/60 text-sm font-serif">
                揲草第 <span className="text-amber-400 text-lg">{Math.min(animStep + 1, 6)}</span> 爻
            </div>
        </div>
    );
};

/**
 * 梅花易数动画 - 数字与干支滚动
 */
export const PlumAnimation: React.FC<AnimationProps> = ({ animStep }) => {
    const [randomChar, setRandomChar] = useState('乾');
    const chars = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    useEffect(() => {
        const timer = setInterval(() => {
            setRandomChar(chars[Math.floor(Math.random() * chars.length)]);
        }, 100);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-10">
            <div className="flex items-center space-x-4">
                <div className="w-20 h-24 bg-slate-800 border-2 border-amber-600/30 flex items-center justify-center rounded-lg shadow-inner">
                    <span className="text-4xl text-amber-500 font-serif animate-pulse">{randomChar}</span>
                </div>
                <div className="text-3xl text-amber-700">·</div>
                <div className="w-20 h-24 bg-slate-800 border-2 border-amber-600/30 flex items-center justify-center rounded-lg shadow-inner">
                    <span className="text-4xl text-amber-500 font-serif animate-bounce">{(animStep + 1) % 9 || 1}</span>
                </div>
            </div>
            <div className="text-amber-500/60 text-sm font-serif">
                观象起卦 · 感应中
            </div>
        </div>
    );
};

/**
 * 随机起卦动画 - 能量流
 */
export const RandomAnimation: React.FC<AnimationProps> = ({ animStep }) => {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="relative w-48 h-48">
                <div className="absolute inset-0 border-2 border-amber-500/20 rounded-full animate-ping" />
                <div className="absolute inset-4 border border-amber-500/40 rounded-full animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-amber-500 rounded-full shadow-glow animate-pulse" />
                </div>
                {/* 随机漫射点 */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-amber-400 rounded-full animate-float opacity-50"
                        style={{
                            top: `${50 + 40 * Math.sin(i * Math.PI / 4)}%`,
                            left: `${50 + 40 * Math.cos(i * Math.PI / 4)}%`,
                            animationDelay: `${i * 0.2}s`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
