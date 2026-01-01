import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { AppState, DivinationMethod } from './types';
import type { LineValue, HexagramInfo, GeminiResponse, InterpretationResult } from './types';

import {
    castHexagram,
    getHexagramInfo,
    getTransformedHexagramInfo
} from './utils/iching';
import {
    HEXAGRAM_MAP,
    COMMON_CATEGORIES,
    BG_MUSIC_URL,
    DEFAULT_VOLUME
} from './constants';
import {
    fetchFullDivination
} from './services/aiService';
import HexagramDisplay from './components/HexagramDisplay';
import {
    CoinsAnimation,
    YarrowAnimation,
    PlumAnimation,
    RandomAnimation
} from './components/MethodAnimations';

// 先天八卦太极图 - 使用本地图片
const TaijiIcon = () => (
    <img
        src="/taiji.png"
        alt="太极八卦图"
        className="w-full h-full opacity-25 animate-spin-slow"
        onError={(e) => {
            // 如果图片丢失，降级显示文字
            e.currentTarget.style.display = 'none';
        }}
    />
);

// 核心工具：将 AI 返回的任何数据结构安全地转换为可渲染字符串
const safeRenderString = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.map(item => safeRenderString(item)).join('\n\n');
    if (typeof val === 'object') {
        // 如果是对象，尝试合并其所有值（处理如 {secondLine: "...", sixthLine: "..."} 的情况）
        return Object.values(val)
            .map(value => safeRenderString(value))
            .join('\n\n');
    }
    return String(val);
};

export default function App() {
    const [state, setState] = useState<AppState>(AppState.HOME);
    const [method, setMethod] = useState<DivinationMethod>(DivinationMethod.COINS);
    const [skipAnimation, setSkipAnimation] = useState(false);
    const [showMethods, setShowMethods] = useState(false); // 控制方法选择的折叠状态

    // Audio
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    // Hexagram Data
    const [lines, setLines] = useState<LineValue[]>([]);
    const [hexInfo, setHexInfo] = useState<HexagramInfo | null>(null);
    const [transHexInfo, setTransHexInfo] = useState<HexagramInfo | null>(null);
    const [transLines, setTransLines] = useState<LineValue[]>([]); // Derived for display

    // Interpretation Data
    const [preliminaryData, setPreliminaryData] = useState<GeminiResponse | null>(null);
    const [category, setCategory] = useState<string>('');
    const [userQuery, setUserQuery] = useState<string>('');
    const [finalResult, setFinalResult] = useState<InterpretationResult | null>(null);

    // Animation Refs
    const [animStep, setAnimStep] = useState(0); // 0-6
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = DEFAULT_VOLUME;
        }
    }, []);

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) audioRef.current.play();
            else audioRef.current.pause();
            setIsMuted(!isMuted);
        }
    };

    const startDivination = () => {
        if (!category) return;
        // 1. Cast
        const result = castHexagram(method);
        setLines(result.lines);

        // 2. Identify
        const info = getHexagramInfo(result.lines);
        setHexInfo(info);

        if (result.hasMovingLines) {
            const tInfo = getTransformedHexagramInfo(result.lines);
            setTransHexInfo(tInfo);
            // Generate transformed lines logic for display (6->7, 9->8)
            const tLines = result.lines.map(l => {
                if (l === 6) return 7; // Old Yin becomes Young Yang
                if (l === 9) return 8; // Old Yang becomes Young Yin
                return l;
            });
            setTransLines(tLines);
        } else {
            setTransHexInfo(null);
            setTransLines([]);
        }

        // 3. Flow - 优化点：无论是否跳过动画，立即发起 API 请求（预请求）
        // 这样在动画播放的几秒钟内，AI 已经在后台生成结果了
        const apiPromise = loadAllData(info, result.lines);

        if (skipAnimation) {
            setState(AppState.INTERPRETATION_LOADING);
        } else {
            setState(AppState.ANIMATING);
            setAnimStep(0);
            runAnimation(info, result.lines);
        }

        if (audioRef.current && !isMuted) audioRef.current.play().catch(() => { });
    };

    const runAnimation = (info: HexagramInfo, currentLines: LineValue[]) => {
        let step = 0;
        const interval = setInterval(() => {
            step++;
            setAnimStep(step);
            if (step >= 6) {
                clearInterval(interval);
                setTimeout(() => {
                    // 动画结束后，如果数据还没回来，显示加载中；如果数据已经回来了，loadAllData 会处理状态切换
                    setState(prev => {
                        // 只有在还是 ANIMATING 状态时才切到 LOADING (防止 API 已经完成切换到了 FINAL_RESULT)
                        if (prev === AppState.ANIMATING) return AppState.INTERPRETATION_LOADING;
                        return prev;
                    });
                }, 400);
            }
        }, 500); // 稍微调快一点单步速度
    };

    const loadAllData = async (info: HexagramInfo, currentLines: LineValue[]) => {
        // 合并为一次请求，节省 RPD 并提高响应一致性
        const result = await fetchFullDivination(info, currentLines, transHexInfo, category, userQuery);
        setPreliminaryData({
            originalText: result.originalText,
            explanation: result.explanation,
            movingLinesExplanation: result.movingLinesExplanation
        } as any);
        setFinalResult({
            coreInterpretation: result.coreInterpretation,
            fortune: result.fortune,
            verse: result.verse,
            details: result.details
        });
        setState(AppState.FINAL_RESULT);
    };

    const handleInterpretationRequest = async () => {
        if (!hexInfo) return;
        setState(AppState.INTERPRETATION_LOADING);
        const res = await fetchFullDivination(
            hexInfo,
            lines,
            transHexInfo,
            category,
            userQuery
        );
        setPreliminaryData({
            originalText: res.originalText,
            explanation: res.explanation,
            movingLinesExplanation: res.movingLinesExplanation
        } as any);
        setFinalResult({
            coreInterpretation: res.coreInterpretation,
            fortune: res.fortune,
            verse: res.verse,
            details: res.details
        });
        setState(AppState.FINAL_RESULT);
    };

    // --- Renders ---

    const renderHome = () => (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 w-full px-4">
            <h1 className="text-5xl md:text-7xl font-cinzel text-amber-500 text-shadow-glow tracking-widest">
                灵 境 易 理
            </h1>
            <p className="text-xl text-slate-300 font-serif italic max-w-lg text-center">
                「天人合一，卜筮知机」
            </p>

            <div className="bg-slate-900/50 p-6 md:p-8 rounded-xl border border-amber-800/30 backdrop-blur-md w-full max-w-full md:max-w-2xl lg:max-w-3xl">
                {/* 1. 问卦分类 (置顶) */}
                <label className="block text-amber-200 mb-3 text-center text-lg">问卦事项</label>
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {COMMON_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(category === cat ? '' : cat)}
                            className={`p-2 text-xs border rounded hover:border-amber-500 transition-all ${category === cat ? 'bg-amber-800 border-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-slate-700 text-slate-300 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* 2. 具体问题 */}
                <textarea
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="具体问题（可选）：例如北方的工作机会是否适合我？"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-amber-100 focus:outline-none focus:border-amber-500 h-20 resize-none text-sm mb-6"
                />

                {/* 3. 占卜方法选择 (折叠区域) */}
                <div className="mb-6 border-t border-slate-800 pt-4">
                    <button
                        onClick={() => setShowMethods(!showMethods)}
                        className="flex items-center justify-center w-full text-slate-500 hover:text-amber-400/80 transition-colors text-sm gap-2"
                    >
                        <span>占卜方法：{
                            method === 'coins' ? '铜钱法' :
                                method === 'yarrow' ? '蓍草法' :
                                    method === 'plum' ? '梅花易数' : '随机起卦'
                        }</span>
                        <svg className={`w-4 h-4 transition-transform ${showMethods ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showMethods && (
                        <div className="grid grid-cols-2 gap-3 mt-4 animate-fade-in">
                            {Object.values(DivinationMethod).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => {
                                        setMethod(m);
                                        setShowMethods(false);
                                    }}
                                    className={`p-2 border rounded transition-all duration-300 text-sm ${method === m
                                        ? 'border-amber-500 bg-amber-900/40 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                        : 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                                        }`}
                                >
                                    {m === 'coins' ? '铜钱法' :
                                        m === 'yarrow' ? '蓍草法' :
                                            m === 'plum' ? '梅花易数' : '随机起卦'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 跳过动画 */}
                <div className="flex items-center justify-center space-x-3 mb-6 cursor-pointer" onClick={() => setSkipAnimation(!skipAnimation)}>
                    <div className={`w-4 h-4 border border-amber-600 rounded flex items-center justify-center ${skipAnimation ? 'bg-amber-600' : ''}`}>
                        {skipAnimation && <span className="text-xs">✓</span>}
                    </div>
                    <span className="text-slate-300 text-sm">跳过起卦过程</span>
                </div>

                <button
                    onClick={startDivination}
                    disabled={!category}
                    className={`w-full py-4 font-cinzel text-xl rounded shadow-lg transform transition-all border border-amber-400/20 ${!category
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white hover:-translate-y-1 shadow-[0_10px_20px_-10px_rgba(180,83,9,0.5)]'
                        }`}
                >
                    {category ? '开启灵境之门' : '请先选择问卦事项'}
                </button>
            </div>
        </div>
    );

    // ... (TaijiIcon stays here)

    const renderAnimation = () => (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-lg mx-auto px-4">
            <div className="text-amber-500 text-2xl mb-12 animate-pulse font-serif tracking-widest">
                {method === DivinationMethod.COINS ? '金钱落地，乾坤定格...' :
                    method === DivinationMethod.YARROW ? '揲草算卦，感应天地...' :
                        method === DivinationMethod.PLUM ? '梅花映雪，此时此境...' :
                            '冥冥之中，自有天算...'}
            </div>

            <div className="w-full bg-slate-900/40 border border-amber-900/20 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
                {/* 差异化动画核心 */}
                {method === DivinationMethod.COINS && <CoinsAnimation animStep={animStep} />}
                {method === DivinationMethod.YARROW && <YarrowAnimation animStep={animStep} />}
                {method === DivinationMethod.PLUM && <PlumAnimation animStep={animStep} />}
                {method === DivinationMethod.RANDOM && <RandomAnimation animStep={animStep} />}

                {/* 底部爻线显示区域 - 统一视觉反馈 */}
                <div className="mt-8 flex flex-col-reverse justify-start items-center gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-32 h-2 rounded-full transition-all duration-500 ${i < animStep
                                ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                : 'bg-slate-800'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderResultView = () => (
        <div className="w-full max-w-5xl mx-auto px-4 pb-20 pt-10">
            <div className="flex flex-col md:flex-row justify-center items-start gap-12 mb-12">
                {hexInfo && (
                    <div className="flex-1 w-full max-w-sm">
                        <HexagramDisplay lines={lines} info={hexInfo} />
                    </div>
                )}

                {transHexInfo && (
                    <div className="flex-1 w-full max-w-sm">
                        <div className="flex items-center justify-center h-full md:pt-32 pb-4">
                            <span className="text-4xl text-amber-600/50">➔</span>
                        </div>
                        <HexagramDisplay lines={transLines} info={transHexInfo} isTransformed />
                    </div>
                )}
            </div>

            {/* Text Details Area */}
            <div className="bg-slate-900/80 border border-slate-700 p-8 rounded-lg shadow-xl backdrop-blur-md min-h-[200px]">
                {!preliminaryData ? (
                    <div className="flex items-center justify-center h-20 space-x-3 text-amber-500">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        <span>卦辞呈现中...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-amber-500 font-bold mb-2 border-b border-amber-500/20 pb-1">卦辞 (原典)</h4>
                            <p className="text-lg text-slate-300 leading-relaxed font-serif">{preliminaryData.originalText}</p>
                        </div>
                        <div>
                            <h4 className="text-amber-500 font-bold mb-2 border-b border-amber-500/20 pb-1">释义</h4>
                            <p className="text-slate-300">{preliminaryData.explanation}</p>
                        </div>
                        {preliminaryData.movingLinesExplanation && (
                            <div>
                                <h4 className="text-amber-500 font-bold mb-2 border-b border-amber-500/20 pb-1">变爻</h4>
                                <p className="text-slate-300 italic">{preliminaryData.movingLinesExplanation}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleInterpretationRequest}
                    className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-3 rounded text-lg font-cinzel shadow-[0_0_20px_rgba(180,83,9,0.4)] transition-all"
                >
                    解卦详断
                </button>
            </div>
        </div>
    );

    const renderInterpretationInput = () => (
        <div className="max-w-2xl mx-auto w-full bg-slate-900/90 border border-amber-800/50 p-8 rounded-xl shadow-2xl backdrop-blur-md">
            <h2 className="text-3xl font-cinzel text-amber-500 text-center mb-8">您欲问何事？</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {COMMON_CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat.split(' ')[0])}
                        className={`p-2 text-sm border rounded hover:border-amber-500 transition-colors ${category === cat.split(' ')[0] ? 'bg-amber-800 border-amber-500 text-white' : 'border-slate-700 text-slate-400'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="mb-8">
                <label className="block text-slate-400 mb-2">具体问题（可选）</label>
                <textarea
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="例如：北方的工作机会是否适合我？"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-4 text-amber-100 focus:outline-none focus:border-amber-500 h-32 resize-none"
                />
            </div>

            <div className="flex justify-between items-center">
                <button onClick={() => setState(AppState.RESULT_VIEW)} className="text-slate-500 hover:text-white transition-colors">返回</button>
                <button
                    onClick={handleInterpretationRequest}
                    disabled={!category && !userQuery}
                    className={`px-8 py-3 rounded font-cinzel transition-all ${(!category && !userQuery) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg'}`}
                >
                    解卦
                </button>
            </div>
        </div>
    );

    const copyToClipboard = () => {
        if (!hexInfo || !finalResult) return;
        const text = `【${hexInfo.nameZh}】${transHexInfo ? ` → ${transHexInfo.nameZh}` : ''}
【${finalResult.fortune}】

${safeRenderString(finalResult.coreInterpretation)}

${finalResult.verse}`;
        navigator.clipboard.writeText(text);
        alert('已复制到剪贴板');
    };

    const handleSaveImage = async () => {
        if (!resultRef.current) return;

        try {
            const canvas = await html2canvas(resultRef.current, {
                backgroundColor: '#020617', // Match slate-950
                scale: 2, // Higher quality
                logging: false,
                useCORS: true
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `iching-result-${hexInfo?.nameZh || '卦象'}.png`;
            link.click();
        } catch (err) {
            console.error("Save image error:", err);
            alert("保存图片失败，请稍后再试");
        }
    };

    const getFortuneColor = (fortune: string) => {
        if (fortune.includes('大吉') || fortune.includes('吉')) return 'text-amber-400 border-amber-500/50 bg-amber-900/20';
        if (fortune.includes('凶') || fortune.includes('厉')) return 'text-red-400 border-red-500/50 bg-red-900/20';
        if (fortune.includes('忧') || fortune.includes('吝')) return 'text-orange-400 border-orange-500/50 bg-orange-900/20';
        return 'text-slate-300 border-slate-500/50 bg-slate-800/50';
    };

    const renderFinalResult = () => (
        <div className="w-full max-w-full md:max-w-4xl mx-auto px-4 py-6 space-y-6">
            {state === AppState.INTERPRETATION_LOADING ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-amber-500/80 animate-pulse text-lg">问卦于先贤...</p>
                </div>
            ) : (
                <>
                    {/* 截图区域开始 - 仅包含卦象和解析 */}
                    <div ref={resultRef} className="space-y-6 p-4 rounded-xl bg-slate-950">
                        {/* 卦象区域 - 压缩展示 */}
                        <div className="bg-slate-900/80 border border-amber-800/30 rounded-xl p-4 md:p-6">
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                                {hexInfo && (
                                    <div className="text-center">
                                        <div className="text-3xl md:text-4xl font-bold text-amber-500 font-serif">{hexInfo.nameZh}</div>
                                        <div className="mt-2">
                                            <span className="px-1.5 py-0.5 bg-amber-900/60 border border-amber-700/50 rounded text-[10px] text-amber-200 font-serif whitespace-nowrap">本卦</span>
                                        </div>
                                        {/* 卦象图形 */}
                                        <div className="mt-3 flex justify-center">
                                            <HexagramDisplay lines={lines} small />
                                        </div>
                                    </div>
                                )}
                                {transHexInfo && (
                                    <>
                                        <span className="text-2xl text-amber-600/50">→</span>
                                        <div className="text-center">
                                            <div className="text-3xl md:text-4xl font-bold text-amber-400 font-serif">{transHexInfo.nameZh}</div>
                                            <div className="mt-2">
                                                <span className="px-1.5 py-0.5 bg-amber-800/60 border border-amber-600/50 rounded text-[10px] text-amber-100 font-serif whitespace-nowrap">变卦</span>
                                            </div>
                                            {/* 变卦卦象 */}
                                            <div className="mt-3 flex justify-center">
                                                <HexagramDisplay lines={transLines} small />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {category && (
                                <div className="text-center mt-3 text-sm text-slate-500">
                                    问卦事项：<span className="text-amber-400">{category}</span>
                                    {userQuery && <span className="text-slate-400"> · {userQuery}</span>}
                                </div>
                            )}

                            {/* 卦象指引 - 放在卦名区域内 */}
                            {finalResult?.coreInterpretation && (
                                <div className="mt-6 pt-4 border-t border-slate-700/50 relative">
                                    {finalResult.fortune && (
                                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full border text-xs font-bold tracking-widest shadow-lg z-10 ${getFortuneColor(finalResult.fortune)}`}>
                                            {finalResult.fortune}
                                        </div>
                                    )}
                                    <div className="text-slate-200 leading-relaxed prose prose-invert prose-amber max-w-none text-left">
                                        <ReactMarkdown>
                                            {safeRenderString(finalResult.coreInterpretation)}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 偈言区域 */}
                        {finalResult?.verse && (
                            <div className="bg-gradient-to-b from-amber-900/20 to-slate-900/60 border border-amber-600/30 rounded-xl p-6 text-center">
                                <pre className="text-xl md:text-2xl text-amber-300 font-serif whitespace-pre-line leading-relaxed">
                                    {finalResult.verse}
                                </pre>
                            </div>
                        )}
                    </div>
                    {/* 截图区域结束 */}

                    {/* 原典补充 - 折叠显示 */}
                    <details className="bg-slate-900/50 border border-slate-700/30 rounded-xl">
                        <summary className="p-4 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors">
                            📜 原典释义与学理分析（点击展开）
                        </summary>
                        <div className="p-4 pt-0 border-t border-slate-700/30">
                            {preliminaryData && (
                                <div className="space-y-3 text-sm text-slate-400">
                                    <div>
                                        <span className="text-amber-500/70">卦辞：</span>
                                        <span>{safeRenderString(preliminaryData.originalText)}</span>
                                    </div>
                                    <div>
                                        <span className="text-amber-500/70">释义：</span>
                                        <span>{safeRenderString(preliminaryData.explanation)}</span>
                                    </div>
                                    {preliminaryData.movingLinesExplanation && (
                                        <div>
                                            <span className="text-amber-500/70">变爻：</span>
                                            <span>{safeRenderString(preliminaryData.movingLinesExplanation)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {finalResult?.details && (
                                <div className="mt-4 text-sm text-slate-400 prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>
                                        {safeRenderString(finalResult.details)}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </details>

                    {/* 操作按钮 */}
                    <div id="action-buttons" className="flex justify-center gap-4 pt-4">
                        <button
                            onClick={handleSaveImage}
                            className="px-6 py-2 border border-amber-600/50 text-amber-500 hover:bg-amber-900/20 rounded transition-colors flex items-center gap-2"
                        >
                            🖼️ 保存图片
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className="px-6 py-2 border border-amber-600/50 text-amber-500 hover:bg-amber-900/20 rounded transition-colors flex items-center gap-2"
                        >
                            📋 复制结果
                        </button>
                        <button
                            onClick={() => {
                                setState(AppState.HOME);
                                setLines([]);
                                setHexInfo(null);
                                setTransHexInfo(null);
                                setPreliminaryData(null);
                                setCategory('');
                                setUserQuery('');
                                setFinalResult(null);
                            }}
                            className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded transition-colors"
                        >
                            重新起卦
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col">
            {/* Background Layers */}
            <div className="fixed inset-0 bg-slate-950 z-0"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black opacity-80 z-0"></div>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-0">
                <TaijiIcon />
            </div>

            {/* Audio Player (Hidden) */}
            <audio ref={audioRef} loop src={BG_MUSIC_URL} />

            {/* Main UI */}
            <div className="relative z-10 flex-grow flex flex-col p-6 overflow-y-auto">
                {/* Header Controls */}
                <div className="absolute top-6 right-6 z-50">
                    <button onClick={toggleMute} className="text-amber-500/50 hover:text-amber-500 transition-colors">
                        {isMuted ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                        )}
                    </button>
                </div>

                <main className="flex-grow flex flex-col justify-center items-center">
                    {state === AppState.HOME && renderHome()}
                    {state === AppState.ANIMATING && renderAnimation()}
                    {state === AppState.RESULT_VIEW && renderResultView()}
                    {state === AppState.INTERPRETATION_INPUT && renderInterpretationInput()}
                    {(state === AppState.INTERPRETATION_LOADING || state === AppState.FINAL_RESULT) && renderFinalResult()}
                </main>

                <footer className="py-4 text-center text-slate-600 text-xs mt-auto">
                    <p>卜卦准则 <br />
                        无疑不卜•诚心正意•一事一占</p>
                </footer>
            </div>
        </div>
    );
}